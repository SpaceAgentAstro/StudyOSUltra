import { Message, AgentRole } from '../types';

export const isValidInput = (text: string, isManual: boolean, attachment: string | null): boolean => {
  return !!(text.trim() || (isManual && attachment));
};

export const createUserMessage = (text: string, attachment: string | null, timestamp: number): Message => {
  const attachmentToSend = attachment ? attachment : null;
  return {
    id: timestamp.toString(),
    role: 'user',
    text: text,
    timestamp: timestamp,
    attachments: attachmentToSend ? [{ type: 'image', url: attachmentToSend }] : undefined
  };
};

export const createBotMessage = (agent: AgentRole, timestamp: number): Message => {
  return {
    id: timestamp.toString(),
    role: 'model',
    agent: agent,
    text: '',
    timestamp: timestamp,
    isThinking: true
  };
};

export const processGroundingChunks = (
  currentGrounding: { title: string; uri: string }[],
  newChunks: any[]
): { title: string; uri: string }[] => {
  const updatedGrounding = [...currentGrounding];

  if (newChunks) {
    newChunks.forEach((chunk: any) => {
      if (chunk.web && chunk.web.uri && chunk.web.title) {
         if (!updatedGrounding.some(g => g.uri === chunk.web.uri)) {
           updatedGrounding.push({ title: chunk.web.title, uri: chunk.web.uri });
         }
      }
    });
  }
  return updatedGrounding;
};
