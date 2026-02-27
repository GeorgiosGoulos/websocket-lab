package com.websocketlab.handler

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.web.reactive.socket.CloseStatus
import org.springframework.web.reactive.socket.WebSocketHandler
import org.springframework.web.reactive.socket.WebSocketMessage
import org.springframework.web.reactive.socket.WebSocketSession
import reactor.core.publisher.Mono

class TokenAuthHandler : WebSocketHandler {

    companion object {
        const val VALID_TOKEN = "test-token"
        val UNAUTHORIZED = CloseStatus(4401, "Unauthorized")
        private val mapper = jacksonObjectMapper()
    }

    override fun handle(session: WebSocketSession): Mono<Void> {
        return session.receive()
            .filter { it.type == WebSocketMessage.Type.TEXT }
            .switchOnFirst({ first, flux ->
                val firstMessage = first.get()
                if (firstMessage == null) {
                    return@switchOnFirst flux.then()
                }

                val authenticated = try {
                    val json = mapper.readValue<Map<String, String>>(firstMessage.payloadAsText)
                    json["type"] == "auth" && json["token"] == VALID_TOKEN
                } catch (_: Exception) {
                    false
                }

                if (!authenticated) {
                    flux.thenMany(session.close(UNAUTHORIZED))
                } else {
                    session.send(
                        flux.skip(1).map { session.textMessage(it.payloadAsText) }
                    )
                }
            }, false)
            .then()
    }
}
