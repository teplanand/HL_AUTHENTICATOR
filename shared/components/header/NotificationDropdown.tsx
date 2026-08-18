import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: "success" | "warning" | "info" | "error";
}

const initialNotifications: Notification[] = [
    {
        id: 1,
        title: "Payment Received",
        message: "Payment of $500.00 from Client X received.",
        time: "5 min ago",
        read: false,
        type: "success",
    },
    {
        id: 2,
        title: "Server Load High",
        message: "CPU usage is above 90%. Please check.",
        time: "45 min ago",
        read: false,
        type: "warning",
    },
    {
        id: 3,
        title: "New Comment",
        message: "Alex commented on the 'Project Alpha' task.",
        time: "2 hours ago",
        read: true,
        type: "info",
    },
    {
        id: 4,
        title: "System Update",
        message: "System maintenance scheduled for tonight.",
        time: "5 hours ago",
        read: true,
        type: "info",
    },
];

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const closeDropdown = () => {
        setIsOpen(false);
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
    };

    const handleNotificationClick = (id: number) => {
        setNotifications(
            notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "success":
                return (
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case "warning":
                return (
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case "error":
                return (
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case "info":
            default:
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="relative flex items-center justify-center w-8 h-8 text-gray-500 transition-colors rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dropdown-toggle lg:h-9 lg:w-9"
            >
                <span className="sr-only">Notifications</span>

                {/* Bell Icon - Outline Style */}
                <svg
                    className="w-6 h-6 stroke-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
                        <span className="relative inline-flex w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                    </span>
                )}
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="absolute right-0 mt-2 w-80 flex flex-col rounded border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:w-96 z-50 overflow-hidden"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notifications
                    </h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 flex items-center gap-1 transition-colors"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mark all read
                        </button>
                    )}
                </div>

                <div className="flex flex-col max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification.id)}
                                className={`relative flex gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer border-b border-gray-50 last:border-0 dark:border-gray-800/50 ${!notification.read ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                                    }`}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {notification.title}
                                        </p>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                            {notification.time}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                        {notification.message}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <span className="absolute top-1/2 right-2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <button className="w-full py-2 text-sm font-medium text-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        View All Notifications
                    </button>
                </div>
            </Dropdown>
        </div>
    );
}
