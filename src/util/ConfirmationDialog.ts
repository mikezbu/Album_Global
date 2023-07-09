import { openConfirmDialog } from 'src/common/components/layout/Confirm'

export default function confirm({
  title,
  message,
  onAnswer,
  confirmActionText,
}: {
  title: string
  message: string
  onAnswer: (answer: boolean) => void
  confirmActionText?: string
}) {
  openConfirmDialog({ title, message, onAnswer, confirmActionText })
}
