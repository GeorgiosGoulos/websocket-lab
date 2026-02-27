package com.websocketlab.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.websocketlab.handler.*
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter

@Configuration
class WebSocketConfig {

    @Bean
    fun webSocketHandlerMapping(objectMapper: ObjectMapper): SimpleUrlHandlerMapping {
        val map = mapOf(
            "/ws/echo" to EchoHandler(),
            "/ws/echo-with-timestamp" to EchoWithTimestampHandler(objectMapper),
            "/ws/auth/bearer" to BearerAuthHandler(),
            "/ws/auth/token" to TokenAuthHandler(),
            "/ws/slow/{delayMs}" to SlowEchoHandler(),
            "/ws/stream/counter" to CounterStreamHandler(),
            "/ws/disconnect/after/{n}" to DisconnectAfterHandler(),
            "/ws/chat" to ChatHandler()
        )
        return SimpleUrlHandlerMapping(map, -1)
    }

    @Bean
    fun webSocketHandlerAdapter(): WebSocketHandlerAdapter = WebSocketHandlerAdapter()
}
