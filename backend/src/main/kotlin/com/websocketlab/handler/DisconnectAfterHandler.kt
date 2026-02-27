package com.websocketlab.handler

import org.springframework.web.reactive.socket.WebSocketHandler
import org.springframework.web.reactive.socket.WebSocketMessage
import org.springframework.web.reactive.socket.WebSocketSession
import reactor.core.publisher.Mono
import java.net.URI

class DisconnectAfterHandler : WebSocketHandler {

    companion object {
        private const val DEFAULT_MAX_MESSAGES = 5L

        internal fun extractMaxMessages(uri: URI): Long {
            val path = uri.path
            val segments = path.trimEnd('/').split('/')
            return segments.lastOrNull()?.toLongOrNull() ?: DEFAULT_MAX_MESSAGES
        }
    }

    override fun handle(session: WebSocketSession): Mono<Void> {
        val maxMessages = extractMaxMessages(session.handshakeInfo.uri)
        return session.send(
            session.receive()
                .filter { it.type == WebSocketMessage.Type.TEXT }
                .map { session.textMessage(it.payloadAsText) }
                .take(maxMessages)
        )
    }
}
