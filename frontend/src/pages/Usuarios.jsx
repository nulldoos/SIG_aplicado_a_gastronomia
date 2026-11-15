import Placeholder from './Placeholder'

export default function Usuarios({ onBack }) {
  return <Placeholder eyebrow="ADMINISTRAÇÃO" title="Listagem de usuários" description="Tela reservada para administradores consultarem e gerenciarem usuários." role="administrador" onBack={onBack} />
}
