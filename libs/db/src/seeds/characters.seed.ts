import { CharacterEntity, ScenarioEntity, SceneEntity } from '@app/core';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export default class CharactersSeed implements Seeder {
  public async run(dataSource: DataSource) {
    await dataSource.transaction(async (tx) => {
      const characterRepository = tx.getRepository(CharacterEntity);
      const scenarioRepository = tx.getRepository(ScenarioEntity);
      const sceneRepository = tx.getRepository(SceneEntity);

      console.log('Characters seed completed');
    });
  }
}
