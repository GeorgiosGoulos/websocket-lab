package com.websocketlab.handler

import org.springframework.web.reactive.socket.WebSocketHandler
import org.springframework.web.reactive.socket.WebSocketMessage
import org.springframework.web.reactive.socket.WebSocketSession
import reactor.core.publisher.Mono

class EchoHandler : WebSocketHandler {
    override fun handle(session: WebSocketSession): Mono<Void> =
        session.send(
            session.receive()
                .filter { it.type == WebSocketMessage.Type.TEXT }
                .map { session.textMessage(it.payloadAsText) }
        )
}
