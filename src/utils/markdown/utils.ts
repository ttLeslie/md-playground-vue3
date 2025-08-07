import type { Token } from 'markdown-it';
import MarkdownIt from 'markdown-it';

export interface ExtendedToken extends Token {
  CompontentType?: string;
}

interface CompontentToken {
  tag: string;
  open: ExtendedToken;
  close?: ExtendedToken;
  children: RendererToken[];
  CompontentType: string;
}

export type RendererToken = ExtendedToken | CompontentToken;

export interface RendererResult {
  tree: RendererToken[];
  tokens: ExtendedToken[];
  error: Error | null;
}

export const getCompontentTree = (initialMarkdown: string): RendererResult => {
  try {
    const markdownParser = MarkdownIt({
      breaks: true,
    });
    const tokens = markdownParser.parse(initialMarkdown, {}) as ExtendedToken[];

    return {
      tree: tokensToCompontentTree(tokens),
      tokens: tokens,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      tree: [],
      tokens: [],
      error: new Error(`解析 Markdown 失败: ${errorMessage}`),
    };
  }
};

export function tokensToCompontentTree(
  tokens: ExtendedToken[],
  tags: string[] = [],
  fences: string[] = [],
): RendererToken[] {
  try {
    const openBlockStask: CompontentToken[] = [];
    const result: RendererToken[] = [];

    // 将节点添加到合适的父节点
    const addNodeToParent = (node: RendererToken) => {
      try {
        setNodeTemplateType(node); // 设置模板类型

        // 递归处理子节点
        if ('children' in node && node.children) {
          node.children = tokensToCompontentTree(node.children as ExtendedToken[], tags, fences);
        }

        // 根据当前层级添加到父节点或顶层
        if (openBlockStask.length > 0) {
          const currentParent = openBlockStask[openBlockStask.length - 1];
          currentParent.children ??= [];
          currentParent.children.push(node);
        } else {
          result.push(node);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`添加节点到父节点失败: ${errorMessage}`);
      }
    };

    // 遍历所有 Token 构建树状结构
    for (const token of tokens) {
      try {
        if (token.nesting === 1) {
          // 处理开始标签
          const newBlock = createBlockToken(token);
          openBlockStask.push(newBlock);
        } else if (token.nesting === -1) {
          // 处理结束标签
          closeBlockToken(token, openBlockStask, addNodeToParent);
        } else {
          // 处理自闭合节点
          addNodeToParent(token);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`处理tokes时出错 (类型: ${token.type}): ${errorMessage}`);
      }
    }

    // 检查未闭合的块级节点
    checkUnclosedBlocks(openBlockStask);

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`构建组件树失败: ${errorMessage}`);
  }
}

function isExtendedToken(node: RendererToken): node is ExtendedToken {
  return 'type' in node; // Token 有 type 属性，CompontentToken 没有
}

function setNodeTemplateType(node: RendererToken) {
  if (node.CompontentType) return; // 已设置则跳过

  if (isExtendedToken(node)) {
    // 原生 Token：默认用 type 作为模板类型
    node.CompontentType = node.type;

    // 代码块特殊处理（如 fence:js、fence:html）
    if (node.type === 'fence') {
      node.CompontentType = `fence:${node.info}`;
    }
  }
}

function createBlockToken(token: ExtendedToken): CompontentToken {
  try {
    const block: CompontentToken = {
      CompontentType: 'default', // 默认类型
      tag: token.tag,
      open: token,
      close: undefined, // 初始化为 undefined，闭合时赋值
      children: [],
    };

    return block;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`创建块级tokens失败: ${errorMessage}`);
  }
}

function closeBlockToken(
  closingToken: ExtendedToken,
  openBlockStask: CompontentToken[],
  addToParent: (node: RendererToken) => void,
) {
  try {
    const correspondingBlock = openBlockStask.pop();

    if (correspondingBlock) {
      correspondingBlock.close = closingToken; // 关联结束标签
      addToParent(correspondingBlock); // 将完整块添加到父节点
    } else {
      throw new Error(`不匹配的结束标签: ${closingToken.tag}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`关闭块级令牌失败: ${errorMessage}`);
  }
}

function checkUnclosedBlocks(openBlockStask: CompontentToken[]) {
  if (openBlockStask.length > 0) {
    const unclosedTags = openBlockStask.map((block) => block.tag).join(', ');
    throw new Error(`检测到未闭合的块级节点: ${unclosedTags}`);
  }
}
