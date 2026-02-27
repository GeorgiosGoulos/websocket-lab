package com.websocketlab.handler

import org.springframework.web.reactive.socket.WebSocketHandler
import org.springframework.web.reactive.socket.WebSocketMessage
import org.springframework.web.reactive.socket.WebSocketSession
import reactor.core.publisher.Mono
import reactor.core.publisher.Sinks

class ChatHandler : WebSocketHandler {

    private val sink: Sinks.Many<String> = Sinks.many().multicast().directBestEffort()

    override fun handle(session: WebSocketSession): Mono<Void> {
        val inbound = session.receive()
            .filter { it.type == WebSocketMessage.Type.TEXT }
            .doOnNext { sink.tryEmitNext(it.payloadAsText) }
            .then()

        val outbound = session.send(
            sink.asFlux().map { session.textMessage(it) }
        )

        return Mono.zip(inbound, outbound).then()
    }
}
