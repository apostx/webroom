class WebSocketUnifiedAdapter extends EventEmitter
    {
        /**
         * @param {WebSocket} webSocket 
         */
        constructor(webSocket)
        {
            super();

            // Bind
            this._onOpen = this._onOpen.bind(this);
            this._onMessage = this._onMessage.bind(this);
            this._onClose = this._onClose.bind(this);

            this._webSocket = webSocket;

            this._webSocket.onopen = this._onOpen;
            this._webSocket.onmessage = this._onMessage;
            this._webSocket.onclose = this._onClose;
        }

        /**
         * @param {Event} event
         */
        _onOpen(event)
        {
            this.emit('open');
        }

        /**
         * @param {MessageEvent} event
         */
        _onMessage(event)
        {
            this.emit('message', event.data);
        }

        /**
         * @param {CloseEvent} event
         */
        _onClose(event)
        {
            this.emit('close');
        }

        /**
         * @param {string} data
         */
        send(data)
        {
            this._webSocket.send(data);
        }

        close()
        {
            this._webSocket.close();
        }
    }