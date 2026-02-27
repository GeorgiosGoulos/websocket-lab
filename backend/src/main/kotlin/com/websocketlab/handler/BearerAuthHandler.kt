package com.websocketlab.handler

import org.springframework.web.reactive.socket.CloseStatus
import org.springframework.web.reactive.socket.WebSocketHandler
import org.springframework.web.reactive.socket.WebSocketMessage
import org.springframework.web.reactive.socket.WebSocketSession
import reactor.core.publisher.Mono

class BearerAuthHandler : WebSocketHandler {

    companion object {
        const val VALID_TOKEN = "test-token"
        val UNAUTHORIZED = CloseStatus(4401, "Unauthorized")
    }

    override fun handle(session: WebSocketSession): Mono<Void> {
        val authHeader = session.handshakeInfo.headers.getFirst("Authorization")
        val headerToken = authHeader?.removePrefix("Bearer ")?.trim()
        val queryToken = session.handshakeInfo.uri.query
            ?.split("&")
            ?.map { it.split("=", limit = 2) }
            ?.firstOrNull { it[0] == "token" }
            ?.getOrNull(1)
        val token = headerToken ?: queryToken

        if (token != VALID_TOKEN) {
            return session.close(UNAUTHORIZED)
        }

        return session.send(
            session.receive()
                .filter { it.type == WebSocketMessage.Type.TEXT }
                .map { session.textMessage(it.payloadAsText) }
        )
    }
}
