package com.websocketlab.handler

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.web.reactive.socket.WebSocketHandler
import org.springframework.web.reactive.socket.WebSocketMessage
import org.springframework.web.reactive.socket.WebSocketSession
import reactor.core.publisher.Mono
import java.time.Instant

class EchoWithTimestampHandler(private val objectMapper: ObjectMapper) : WebSocketHandler {
    override fun handle(session: WebSocketSession): Mono<Void> =
        session.send(
            session.receive()
                .filter { it.type == WebSocketMessage.Type.TEXT }
                .map { msg ->
                    val response = mapOf(
                        "originalMessage" to msg.payloadAsText,
                        "serverTimestamp" to Instant.now().toString()
                    )
                    session.textMessage(objectMapper.writeValueAsString(response))
                }
        )
}
