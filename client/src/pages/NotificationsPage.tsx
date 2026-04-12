import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../api/notifications'
import { useToast } from '../hooks/useToast'
import Toast from '../components/ui/Toast'
import Button from '../components/ui/Button'

const notificationIcons: Record<string, string> = {
  POST_APPROVED: '🎉',
  POST_REJECTED: '❌',
  COMMENT_ON_POST: '💬',
  COMMENT_ON_QUESTION: '💬',
  MENTION: '📢',
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { toast, showToast, hideToast } = useToast()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll().then(r => r.data),
  })

  // Mark single as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  // Mark all as read
  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
      showToast('All notifications marked as read', 'success')
    },
  })

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-blue-600 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            onClick={() => markAllMutation.mutate()}
            isLoading={markAllMutation.isPending}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      {notifications?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-400 text-lg">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">
            You'll be notified when something happens
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications?.map(notification => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.isRead) {
                  markAsReadMutation.mutate(notification.id)
                }
              }}
              className={`
                flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all
                ${notification.isRead
                  ? 'bg-white border-gray-200 opacity-70'
                  : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                }
              `}
            >
              {/* Icon */}
              <div className="text-2xl shrink-0 mt-0.5">
                {notificationIcons[notification.type] ?? '🔔'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${notification.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                  {notification.title}
                </p>
                <p className={`text-sm mt-0.5 ${notification.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Unread dot */}
              {!notification.isRead && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}