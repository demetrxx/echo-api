Согласованное видение авторизации для Echo (NestJS API + React SPA).
Это спецификация: что именно делаем, без реализации кода.

---

## 0) Контекст и цели

- Фронт и бэк на разных сабдоменах одного site (`.echohq.com`).
- Без серверных сессий (но refresh храним в БД для ревокации).
- Доступ с нескольких устройств.
- OAuth через Google: Authorization Code + PKCE.
- Email подтверждение с возможностью отключения в dev (`AUTH_SKIP_EMAIL_CONFIRM`).

---

## 1) Токены и хранение

- Access JWT живет только в памяти SPA.
- Refresh JWT живет только в HttpOnly cookie.
- Access TTL: 15 минут.
- Refresh TTL: 30 дней.
- Refresh rotation включен.

---

## 2) Cookie политика (prod)

- `HttpOnly; Secure; SameSite=Lax`
- `Domain=.echohq.com`
- `Path=/auth`

Reasoning:
- Сабдомены → один site: `SameSite=Lax` подходит.
- `Secure` обязателен в проде.
- Cookie не летает на все запросы.

---

## 3) Потоки (flows)

### Login (email/pass)

1. Клиент вызывает `/auth/login` (или `/auth/google/callback`).
2. Сервер:

    * выдаёт **access JWT** в ответе (JSON),
    * ставит **refresh cookie**: `HttpOnly; Secure; SameSite=...; Path=/auth`
3. Клиент кладёт access в память.

### Email confirmation

1. После `/auth/register` сервер отправляет письмо с токеном (если `AUTH_SKIP_EMAIL_CONFIRM=false`).
2. Клиент вызывает `/auth/confirm-email` с токеном.
3. Сервер подтверждает email и выдает access + refresh.

### Resend confirmation

- Клиент вызывает `/auth/resend-confirmation` с email.
- Сервер отправляет новый токен (с rate-limit, без раскрытия статуса email).

### Refresh (rotation)

1. Клиент вызывает `/auth/refresh` с `credentials: 'include'`.
2. Сервер проверяет refresh cookie:

    * если ок → **вращает refresh** (старый аннулирует) + отдаёт новый access в JSON.
    * если нет → 401 → фронт делает logout.

### Logout

- Клиент вызывает `/auth/logout` (include credentials).
- Сервер чистит cookie и помечает refresh в БД как отозванный.
- Logout действует только на текущую refresh-сессию.

---

## 4) Security правила

### Refresh storage (обязательное)

- Refresh хранится в БД как hash + метаданные.
- Без этого нельзя отзывать украденный refresh.

### Refresh reuse detection (обязательное)

- Если обнаружен уже замененный refresh → **ревокация всех refresh-сессий** пользователя.

---

## 5) Google OAuth (Authorization Code + PKCE)

Flow:

1. React делает OAuth с PKCE напрямую с Google.
2. Получает `code`.
3. Отправляет `code` на бэк (`POST /auth/google/exchange`).
4. Бэк обменивает code на Google tokens, валидирует профиль, находит/создает user.
5. Бэк выдает **свои** access + refresh (cookie).

---

## 6) JWT детали

**Access JWT**:

* `sub` (user id)
* `email`, `roles` (минимально необходимое)
* TTL 5–15 минут
* подпись HS256 (секрет) или RS256 (ключи)

**Refresh JWT**:

* TTL 7–30 дней
* отдельный секрет/ключ **отличный от access**
* в payload добавь `jti` (id токена) — очень удобно для rotation/ревокации.

---

## 7) React: хранение access “в памяти” + авто-refresh

### 5.1. API клиент

* Все запросы к API:

    * добавляют `Authorization: Bearer <access>` если он есть
    * `fetch(..., { credentials: 'include' })` **только когда нужно cookie** (refresh/logout). На обычные API-запросы cookie не нужна — но можно включать глобально, если не мешает.

### 5.2. Обработка 401

Паттерн:

* Если запрос получил 401:

    * если уже идёт refresh → ждёшь его
    * иначе запускаешь refresh один раз
    * если refresh успешен → повторяешь исходный запрос
    * если нет → logout

Это убирает гонки (10 запросов одновременно не должны сделать 10 refresh).

### 5.3. При старте приложения

* У тебя нет access (только refresh cookie).
* Делай “silent refresh” один раз:

    * `POST /auth/refresh` (include credentials)
    * если ок → access в память → считаем пользователя залогиненным

---

---

## 8) Безопасность (самые частые косяки)

1. **HttpOnly cookie защищает от XSS**, но **не от CSRF**.

    * Если `SameSite=None`, CSRF становится реально важным.
    * Решения:

        * держать refresh endpoint на отдельном origin + жесткий CORS,
        * **double submit** CSRF token (не HttpOnly cookie + header),
        * или `SameSite=Lax/Strict` если позволяет архитектура.
    * На практике: для `/auth/refresh` часто делают CSRF-токен обязательным.

2. **CORS**

    * `Access-Control-Allow-Origin` только конкретный домен.
    * `Access-Control-Allow-Credentials: true`.

3. **Secure**

    * В проде refresh cookie только `Secure` (т.е. https).

4. **Rotation**

    * Без rotation украденный refresh будет работать долго.

---

## 9) Минимальная структура модулей NestJS

* `AuthModule`

    * `AuthController`
    * `AuthService`
    * `JwtAccessStrategy` (Guard на access)
    * `RefreshTokenService` (выдача/rotation/ревок)
* `UsersModule`
* `Prisma/TypeORM` (где хранишь refresh hashes)

---

## 9) “Проверка, что ты всё сделал правильно” (чеклист)

* [ ] refresh cookie: `HttpOnly; Secure; SameSite=...; Path=/auth`
* [ ] refresh endpoint принимает только POST
* [ ] CORS: конкретный origin + credentials
* [ ] access нигде не пишется в localStorage/sessionStorage
* [ ] на фронте есть очередь refresh (один refresh за раз)
* [ ] refresh rotation включён + хранение хэша в БД
* [ ] logout реально отзывает refresh и чистит cookie
* [ ] прод на https

---

Если хочешь — я могу дать тебе **конкретные куски кода** под твой стек (NestJS: guards/strategies + контроллеры + пример fetch wrapper), но мне нужно знать 3 вещи (без этого можно, но будет больше “допущений”):

1. Фронт и бэк на одном домене/сабдоменах или на разных? (пример: `localhost:3000` и `localhost:4000` / `app.site.com` и `api.site.com`)
2. Ты используешь Passport в NestJS или хочешь без него?
3. Какая БД/ORM (Prisma, TypeORM, Drizzle, другое) — чтобы показать хранение refresh-хэшей.
