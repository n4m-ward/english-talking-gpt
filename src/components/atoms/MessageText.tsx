interface MessageTextProps {
  content: string;
  variant: 'user' | 'assistant' | 'correction';
}

export function MessageText({ content, variant }: MessageTextProps) {
  const variantClasses = {
    user: 'text-white',
    assistant: 'text-black',
    correction: 'text-yellow-700',
  };

  return (
    <div className={variantClasses[variant]}>
      {content}
    </div>
  );
}
