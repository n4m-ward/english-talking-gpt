import { Select } from '../atoms/Select';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

const AVAILABLE_LANGUAGES = {
  'português': 'pt-BR',
  'inglês': 'en-US',
  'espanhol': 'es-ES',
  'francês': 'fr-FR',
  'alemão': 'de-DE',
  'italiano': 'it-IT',
} as const;

interface FormData {
  nivelDeIngles: string;
  linguagem: string;
  tipoDaConversa: string;
}

interface NewChatFormProps {
  formData: FormData;
  onFormDataChange: (newData: Partial<FormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function NewChatForm({ formData, onFormDataChange, onSubmit }: NewChatFormProps) {
  const languageOptions = Object.keys(AVAILABLE_LANGUAGES).map(lang => ({
    value: lang,
    label: lang.charAt(0).toUpperCase() + lang.slice(1)
  }));

  const levelOptions = [
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediario', label: 'Intermediário' },
    { value: 'avancado', label: 'Avançado' },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Select
        label="Nível de Inglês"
        value={formData.nivelDeIngles}
        onChange={(e) => onFormDataChange({ nivelDeIngles: e.target.value })}
        options={levelOptions}
        required
      />

      <Select
        label="Linguagem"
        value={formData.linguagem}
        onChange={(e) => onFormDataChange({ linguagem: e.target.value })}
        options={languageOptions}
        required
      />

      <Input
        label="Tipo da Conversa"
        type="text"
        value={formData.tipoDaConversa}
        onChange={(e) => onFormDataChange({ tipoDaConversa: e.target.value })}
        placeholder="Ex: Viagens, Trabalho, Hobbies"
        required
      />

      <Button type="submit" className="w-full py-2">
        Iniciar Conversa
      </Button>
    </form>
  );
}
