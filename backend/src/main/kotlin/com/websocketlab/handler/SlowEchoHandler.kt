package com.websocketlab.handler

import org.springframework.web.reactive.socket.WebSocketHandler
import org.springframework.web.reactive.socket.WebSocketMessage
import org.springframework.web.reactive.socket.WebSocketSession
import reactor.core.publisher.Mono
import java.net.URI
import java.time.Duration

class SlowEchoHandler : WebSocketHandler {

    companion object {
        private const val DEFAULT_DELAY_MS = 1000L

        internal fun extractDelayMs(uri: URI): Long {
            val path = uri.path
            val segments = path.trimEnd('/').split('/')
            return segments.lastOrNull()?.toLongOrNull() ?: DEFAULT_DELAY_MS
        }
    }

    override fun handle(session: WebSocketSession): Mono<Void> {
        val delayMs = extractDelayMs(session.handshakeInfo.uri)
        return session.send(
            session.receive()
                .filter { it.type == WebSocketMessage.Type.TEXT }
                .map { it.payloadAsText }
                .delayElements(Duration.ofMillis(delayMs))
                .map { session.textMessage(it) }
        )
    }
}
