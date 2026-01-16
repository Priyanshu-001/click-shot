function preprocess(shadowRoot) {
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    shadowRoot.appendChild(notificationContainer);
}