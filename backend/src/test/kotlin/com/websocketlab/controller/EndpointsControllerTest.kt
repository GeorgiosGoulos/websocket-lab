package com.websocketlab.controller

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class EndpointsControllerTest {

    private val controller = EndpointsController()

    @Test
    fun `given the endpoints list, when retrieved, then contains all 8 endpoints`() {
        val endpoints = controller.getEndpoints()
        assertEquals(8, endpoints.size)
    }

    @Test
    fun `given the endpoints list, when retrieved, then all have required fields`() {
        val endpoints = controller.getEndpoints()
        endpoints.forEach { endpoint ->
            assertTrue(endpoint.path.isNotBlank(), "path should not be blank")
            assertTrue(endpoint.name.isNotBlank(), "name should not be blank")
            assertTrue(endpoint.description.isNotBlank(), "description should not be blank")
            assertTrue(endpoint.category.isNotBlank(), "category should not be blank")
        }
    }

    @Test
    fun `given the endpoints list, when retrieved, then contains expected categories`() {
        val endpoints = controller.getEndpoints()
        val categories = endpoints.map { it.category }.toSet()
        assertTrue(categories.contains("basic"))
        assertTrue(categories.contains("auth"))
        assertTrue(categories.contains("timing"))
        assertTrue(categories.contains("streaming"))
        assertTrue(categories.contains("lifecycle"))
        assertTrue(categories.contains("multi-client"))
    }

    @Test
    fun `given the endpoints list, when retrieved, then endpoints with path params have them defined`() {
        val endpoints = controller.getEndpoints()
        val withParams = endpoints.filter { it.path.contains("{") }
        assertEquals(2, withParams.size)
        withParams.forEach { endpoint ->
            assertTrue(endpoint.pathParams.isNotEmpty(), "${endpoint.path} should have pathParams")
        }
    }
}
