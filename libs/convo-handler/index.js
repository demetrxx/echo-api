"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConversation = parseConversation;
exports.findAllPaths = findAllPaths;
exports.extractVisibleMessages = extractVisibleMessages;
exports.formatMarkdown = formatMarkdown;
var fs = require("fs/promises");
var path = require("path");
var convo_1 = require("./convo");
// Find root node (where parent is null or 'client-created-root')
function findRoot(mapping) {
    for (var _i = 0, _a = Object.entries(mapping); _i < _a.length; _i++) {
        var _b = _a[_i], id = _b[0], node = _b[1];
        if (node.parent === null) {
            return id;
        }
    }
    throw new Error('No root node found');
}
// DFS to find all paths from root to leaves
function findAllPaths(mapping) {
    var rootId = findRoot(mapping);
    var paths = [];
    function dfs(nodeId, currentPath) {
        var node = mapping[nodeId];
        if (!node)
            return;
        currentPath.push(nodeId);
        if (node.children.length === 0) {
            // Leaf node - save this path
            paths.push(__spreadArray([], currentPath, true));
        }
        else {
            // Continue DFS for each child
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var childId = _a[_i];
                dfs(childId, currentPath);
            }
        }
        currentPath.pop();
    }
    dfs(rootId, []);
    return paths;
}
// Extract visible messages from a path
function extractVisibleMessages(nodePath, mapping) {
    var _a, _b;
    var messages = [];
    for (var _i = 0, nodePath_1 = nodePath; _i < nodePath_1.length; _i++) {
        var nodeId = nodePath_1[_i];
        var node = mapping[nodeId];
        if (!(node === null || node === void 0 ? void 0 : node.message))
            continue;
        var msg = node.message;
        // Skip hidden messages
        if ((_a = msg.metadata) === null || _a === void 0 ? void 0 : _a.is_visually_hidden_from_conversation)
            continue;
        // Only keep user and assistant messages
        if (msg.author.role !== 'user' && msg.author.role !== 'assistant')
            continue;
        // Extract text content
        var content = ((_b = msg.content.parts) === null || _b === void 0 ? void 0 : _b.join('\n')) || '';
        if (!content.trim())
            continue;
        messages.push({
            role: msg.author.role,
            content: content.trim(),
        });
    }
    return messages;
}
// Find ALL user messages that defined this branch (at each fork point)
function identifyBranchMessages(targetPath, mapping) {
    var _a, _b, _c, _d, _e;
    var branchMessages = [];
    for (var i = 0; i < targetPath.length; i++) {
        var nodeId = targetPath[i];
        var node = mapping[nodeId];
        // Check if this node's parent has multiple children (branch point)
        if (node === null || node === void 0 ? void 0 : node.parent) {
            var parentNode = mapping[node.parent];
            if (parentNode && parentNode.children.length > 1) {
                // This is a node after a branch point - find the user message
                // It could be this node or a descendant
                var currentId = nodeId;
                while (currentId) {
                    var currentNode = mapping[currentId];
                    if (!currentNode)
                        break;
                    if (((_a = currentNode.message) === null || _a === void 0 ? void 0 : _a.author.role) === 'user' &&
                        !((_c = (_b = currentNode.message) === null || _b === void 0 ? void 0 : _b.metadata) === null || _c === void 0 ? void 0 : _c.is_visually_hidden_from_conversation)) {
                        var content = (_e = (_d = currentNode.message.content.parts) === null || _d === void 0 ? void 0 : _d.join('\n')) === null || _e === void 0 ? void 0 : _e.trim();
                        if (content) {
                            branchMessages.push(content);
                        }
                        break;
                    }
                    // Move to first child if no user message found yet
                    if (currentNode.children.length > 0) {
                        currentId = currentNode.children[0];
                    }
                    else {
                        break;
                    }
                }
            }
        }
    }
    return branchMessages;
}
// Format messages as markdown
function formatMarkdown(messages, branchMessages, versionNum) {
    var md = "# Version ".concat(versionNum, "\n\n");
    if (branchMessages.length > 0) {
        md += "## Branch Key Messages\n\n";
        branchMessages.forEach(function (msg, idx) {
            md += "### ".concat(idx + 1, ".\n> ").concat(msg.replace(/\n/g, '\n> '), "\n\n");
        });
        md += "---\n\n";
    }
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var msg = messages_1[_i];
        var label = msg.role === 'user' ? 'User' : 'AI';
        md += "".concat(label, ": ").concat(msg.content, "\n\n");
    }
    return md;
}
// Cyrillic to Latin transliteration map
var cyrillicToLatin = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'kh',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'shch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
};
// Slugify title for folder name (supports Cyrillic)
function slugify(text) {
    var transliterated = text
        .toLowerCase()
        .split('')
        .map(function (char) { var _a; return (_a = cyrillicToLatin[char]) !== null && _a !== void 0 ? _a : char; })
        .join('');
    var slug = transliterated
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    return slug || 'conversation';
}
// Format date as DD-MM-YYYY
function formatDate(timestamp) {
    var date = new Date(timestamp * 1000);
    var day = String(date.getDate()).padStart(2, '0');
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var year = date.getFullYear();
    return "".concat(day, "-").concat(month, "-").concat(year);
}
// Main function
function parseConversation(convo_2) {
    return __awaiter(this, arguments, void 0, function (convo, outputDir) {
        var slug, dateStr, folderPath, allPaths, createdFiles, i, nodePath, messages, branchMessages, markdown, filePath;
        if (outputDir === void 0) { outputDir = './output'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    slug = slugify(convo.title);
                    dateStr = formatDate(convo.create_time);
                    folderPath = path.join(outputDir, slug, dateStr);
                    // Create output directory
                    return [4 /*yield*/, fs.mkdir(folderPath, { recursive: true })];
                case 1:
                    // Create output directory
                    _a.sent();
                    allPaths = findAllPaths(convo.mapping);
                    createdFiles = [];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < allPaths.length)) return [3 /*break*/, 5];
                    nodePath = allPaths[i];
                    messages = extractVisibleMessages(nodePath, convo.mapping);
                    // Skip empty paths
                    if (messages.length === 0)
                        return [3 /*break*/, 4];
                    branchMessages = identifyBranchMessages(nodePath, convo.mapping);
                    markdown = formatMarkdown(messages, branchMessages, i + 1);
                    filePath = path.join(folderPath, "version-".concat(i + 1, ".md"));
                    return [4 /*yield*/, fs.writeFile(filePath, markdown, 'utf-8')];
                case 3:
                    _a.sent();
                    createdFiles.push(filePath);
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, createdFiles];
            }
        });
    });
}
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, parseConversation(convo_1.convo, './output')];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
