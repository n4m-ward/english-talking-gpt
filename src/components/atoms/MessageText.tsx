import type { Message } from '../organisms/ChatMessages';

interface MessageTextProps {
  content: string;
  variant: Message['role'] | 'correction';
}

export function MessageText({ content, variant }: MessageTextProps) {
  const variantClasses = {
    user: 'text-white',
    assistant: 'text-black',
    correction: 'text-yellow-700',
  } as const;

  return (
    <div className={variantClasses[variant]}>
      {content}
    </div>
  );
}
