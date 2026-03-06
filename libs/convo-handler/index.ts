import * as fs from 'fs/promises';
import * as path from 'path';

import { convo } from './convo';

// Types
interface ChatGPTMessage {
  id: string;
  author: { role: 'user' | 'assistant' | 'system' };
  content: { content_type: string; parts?: string[] };
  metadata?: { is_visually_hidden_from_conversation?: boolean };
}

interface ChatGPTNode {
  id: string;
  message: ChatGPTMessage | null;
  parent: string | null;
  children: string[];
}

export interface ChatGPTConversation {
  title: string;
  create_time: number;
  mapping: Record<string, ChatGPTNode>;
}

interface VisibleMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Find root node (where parent is null or 'client-created-root')
function findRoot(mapping: Record<string, ChatGPTNode>): string {
  for (const [id, node] of Object.entries(mapping)) {
    if (node.parent === null) {
      return id;
    }
  }
  throw new Error('No root node found');
}

// DFS to find all paths from root to leaves
function findAllPaths(mapping: Record<string, ChatGPTNode>): string[][] {
  const rootId = findRoot(mapping);
  const paths: string[][] = [];

  function dfs(nodeId: string, currentPath: string[]): void {
    const node = mapping[nodeId];
    if (!node) return;

    currentPath.push(nodeId);

    if (node.children.length === 0) {
      // Leaf node - save this path
      paths.push([...currentPath]);
    } else {
      // Continue DFS for each child
      for (const childId of node.children) {
        dfs(childId, currentPath);
      }
    }

    currentPath.pop();
  }

  dfs(rootId, []);
  return paths;
}

// Extract visible messages from a path
function extractVisibleMessages(
  nodePath: string[],
  mapping: Record<string, ChatGPTNode>,
): VisibleMessage[] {
  const messages: VisibleMessage[] = [];

  for (const nodeId of nodePath) {
    const node = mapping[nodeId];
    if (!node?.message) continue;

    const msg = node.message;

    // Skip hidden messages
    if (msg.metadata?.is_visually_hidden_from_conversation) continue;

    // Only keep user and assistant messages
    if (msg.author.role !== 'user' && msg.author.role !== 'assistant') continue;

    // Extract text content
    const content = msg.content.parts?.join('\n') || '';
    if (!content.trim()) continue;

    messages.push({
      role: msg.author.role,
      content: content.trim(),
    });
  }

  return messages;
}

// Find ALL user messages that defined this branch (at each fork point)
function identifyBranchMessages(
  targetPath: string[],
  mapping: Record<string, ChatGPTNode>,
): string[] {
  const branchMessages: string[] = [];

  for (let i = 0; i < targetPath.length; i++) {
    const nodeId = targetPath[i];
    const node = mapping[nodeId];

    // Check if this node's parent has multiple children (branch point)
    if (node?.parent) {
      const parentNode = mapping[node.parent];
      if (parentNode && parentNode.children.length > 1) {
        // This is a node after a branch point - find the user message
        // It could be this node or a descendant
        let currentId = nodeId;
        while (currentId) {
          const currentNode = mapping[currentId];
          if (!currentNode) break;

          if (
            currentNode.message?.author.role === 'user' &&
            !currentNode.message?.metadata?.is_visually_hidden_from_conversation
          ) {
            const content = currentNode.message.content.parts
              ?.join('\n')
              ?.trim();
            if (content) {
              branchMessages.push(content);
            }
            break;
          }

          // Move to first child if no user message found yet
          if (currentNode.children.length > 0) {
            currentId = currentNode.children[0];
          } else {
            break;
          }
        }
      }
    }
  }

  return branchMessages;
}

// Format messages as markdown
function formatMarkdown(
  messages: VisibleMessage[],
  branchMessages: string[],
  versionNum: number,
): string {
  let md = `# Version ${versionNum}\n\n`;

  if (branchMessages.length > 0) {
    md += `## Branch Key Messages\n\n`;
    branchMessages.forEach((msg, idx) => {
      md += `### ${idx + 1}.\n> ${msg.replace(/\n/g, '\n> ')}\n\n`;
    });
    md += `---\n\n`;
  }

  for (const msg of messages) {
    const label = msg.role === 'user' ? 'User' : 'AI';
    md += `${label}: ${msg.content}\n\n`;
  }

  return md;
}

// Cyrillic to Latin transliteration map
const cyrillicToLatin: Record<string, string> = {
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
function slugify(text: string): string {
  const transliterated = text
    .toLowerCase()
    .split('')
    .map((char) => cyrillicToLatin[char] ?? char)
    .join('');

  const slug = transliterated
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  return slug || 'conversation';
}

// Format date as DD-MM-YYYY
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Main function
export async function parseConversation(
  convo: ChatGPTConversation,
  outputDir: string = './output',
): Promise<string[]> {
  const slug = slugify(convo.title);
  const dateStr = formatDate(convo.create_time);
  const folderPath = path.join(outputDir, slug, dateStr);

  // Create output directory
  await fs.mkdir(folderPath, { recursive: true });

  // Find all conversation paths
  const allPaths = findAllPaths(convo.mapping);

  const createdFiles: string[] = [];

  for (let i = 0; i < allPaths.length; i++) {
    const nodePath = allPaths[i];
    const messages = extractVisibleMessages(nodePath, convo.mapping);

    // Skip empty paths
    if (messages.length === 0) continue;

    const branchMessages = identifyBranchMessages(nodePath, convo.mapping);
    const markdown = formatMarkdown(messages, branchMessages, i + 1);

    const filePath = path.join(folderPath, `version-${i + 1}.md`);
    await fs.writeFile(filePath, markdown, 'utf-8');
    createdFiles.push(filePath);
  }

  return createdFiles;
}

(async () => {
  await parseConversation(convo as any, './output');
})();

// Export utilities
export { findAllPaths, extractVisibleMessages, formatMarkdown };
