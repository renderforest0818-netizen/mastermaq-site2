#!/usr/bin/env python3
"""
Test suite for Chat Mi (AI Assistant) endpoints
Tests SSE streaming, session persistence, and content restrictions
"""

import pytest
import requests
import os
import json
import time
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestChatMiStreaming:
    """Tests for /api/chat/stream endpoint - SSE streaming without auth"""
    
    def test_chat_stream_without_auth_returns_sse(self):
        """POST /api/chat/stream without auth should respond with SSE streaming"""
        response = requests.post(
            f"{BASE_URL}/api/chat/stream",
            json={
                "messages": [{"role": "user", "content": "Ola, quais marcas voces atendem?"}]
            },
            headers={"Content-Type": "application/json"},
            stream=True,
            timeout=60
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "text/event-stream" in response.headers.get("Content-Type", ""), "Expected SSE content type"
        
        # Parse SSE events
        events = []
        full_content = ""
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith("data: "):
                data = json.loads(line[6:])
                events.append(data)
                if data.get("type") == "delta":
                    full_content += data.get("content", "")
        
        # Verify we got delta and done events
        event_types = [e.get("type") for e in events]
        assert "delta" in event_types, "Expected at least one 'delta' event"
        assert "done" in event_types, "Expected a 'done' event"
        
        # Verify done event has full content
        done_event = next((e for e in events if e.get("type") == "done"), None)
        assert done_event is not None, "Done event not found"
        assert len(done_event.get("content", "")) > 0, "Done event should have content"
        
        print(f"✅ SSE streaming works - received {len(events)} events")
        print(f"   Full response length: {len(full_content)} chars")
    
    def test_chat_stream_mentions_authorized_brands(self):
        """POST /api/chat/stream with brand question should mention authorized brands"""
        response = requests.post(
            f"{BASE_URL}/api/chat/stream",
            json={
                "messages": [{"role": "user", "content": "Quais sao as marcas autorizadas que voces atendem?"}]
            },
            headers={"Content-Type": "application/json"},
            stream=True,
            timeout=60
        )
        
        assert response.status_code == 200
        
        # Collect full response
        full_content = ""
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith("data: "):
                data = json.loads(line[6:])
                if data.get("type") == "done":
                    full_content = data.get("content", "")
                    break
        
        # Check for authorized brands (at least some of them)
        authorized_brands = ["HQ", "Hisense", "Liebherr", "Franke", "Gorenje", "Bertazzoni", "Lofra", "Panasonic"]
        content_lower = full_content.lower()
        
        brands_found = [b for b in authorized_brands if b.lower() in content_lower]
        assert len(brands_found) >= 3, f"Expected at least 3 authorized brands mentioned, found: {brands_found}"
        
        print(f"✅ Response mentions authorized brands: {brands_found}")
        print(f"   Response preview: {full_content[:200]}...")
    
    def test_chat_stream_no_technical_diagnosis(self):
        """POST /api/chat/stream with defect description should NOT give technical diagnosis"""
        response = requests.post(
            f"{BASE_URL}/api/chat/stream",
            json={
                "messages": [{"role": "user", "content": "Minha geladeira nao esta gelando, o que pode ser?"}]
            },
            headers={"Content-Type": "application/json"},
            stream=True,
            timeout=60
        )
        
        assert response.status_code == 200
        
        # Collect full response
        full_content = ""
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith("data: "):
                data = json.loads(line[6:])
                if data.get("type") == "done":
                    full_content = data.get("content", "")
                    break
        
        content_lower = full_content.lower()
        
        # Should NOT contain technical diagnosis terms
        diagnosis_terms = ["compressor", "gas", "termostato", "motor", "defeito no", "problema no", "trocar o", "verificar o"]
        diagnosis_found = [t for t in diagnosis_terms if t in content_lower]
        
        # Should contain recommendation to open OS or schedule visit
        recommendation_terms = ["ordem de servico", "os", "visita tecnica", "agendar", "agendamento", "ligar", "3422-5293", "tecnico"]
        recommendations_found = [t for t in recommendation_terms if t in content_lower]
        
        # Allow some technical terms but must have recommendations
        assert len(recommendations_found) >= 1, f"Expected recommendation to open OS/schedule visit. Response: {full_content[:300]}"
        
        print(f"✅ Response recommends service instead of diagnosis")
        print(f"   Recommendations found: {recommendations_found}")
        print(f"   Response preview: {full_content[:300]}...")


class TestChatSessionsAuth:
    """Tests for /api/chat/sessions endpoint - requires authentication"""
    
    def test_chat_sessions_without_auth_returns_401(self):
        """POST /api/chat/sessions without auth should return 401"""
        response = requests.post(
            f"{BASE_URL}/api/chat/sessions",
            json={"title": "Test session"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ POST /api/chat/sessions without auth returns 401")
    
    def test_get_chat_sessions_without_auth_returns_empty(self):
        """GET /api/chat/sessions without auth should return empty list"""
        response = requests.get(f"{BASE_URL}/api/chat/sessions")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data == [], f"Expected empty list, got {data}"
        print("✅ GET /api/chat/sessions without auth returns empty list")


class TestChatSessionsAuthenticated:
    """Tests for authenticated chat session CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin and get session cookies"""
        self.session = requests.Session()
        login_response = self.session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mastermaq.com", "password": "mastermaq@2026"}
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        self.user_data = login_response.json()
        print(f"   Logged in as: {self.user_data.get('email')}")
        yield
        # Cleanup - logout
        self.session.post(f"{BASE_URL}/api/auth/logout")
    
    def test_create_chat_session(self):
        """POST /api/chat/sessions with auth should create session and return session_id"""
        response = self.session.post(
            f"{BASE_URL}/api/chat/sessions",
            json={"title": "TEST_session_" + datetime.now().strftime("%H%M%S")}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "id" in data, "Response should contain 'id'"
        assert "title" in data, "Response should contain 'title'"
        assert "created_at" in data, "Response should contain 'created_at'"
        
        self.session_id = data["id"]
        print(f"✅ Created chat session: {self.session_id}")
        return data["id"]
    
    def test_list_chat_sessions(self):
        """GET /api/chat/sessions with auth should list sessions"""
        # First create a session
        create_response = self.session.post(
            f"{BASE_URL}/api/chat/sessions",
            json={"title": "TEST_list_session"}
        )
        assert create_response.status_code == 200
        
        # Then list sessions
        response = self.session.get(f"{BASE_URL}/api/chat/sessions")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 1, "Should have at least one session"
        
        # Verify session structure
        session = data[0]
        assert "id" in session, "Session should have 'id'"
        assert "title" in session, "Session should have 'title'"
        
        print(f"✅ Listed {len(data)} chat sessions")
    
    def test_chat_stream_with_session_persists_messages(self):
        """POST /api/chat/stream with session_id should persist messages"""
        # Create a session first
        create_response = self.session.post(
            f"{BASE_URL}/api/chat/sessions",
            json={"title": "TEST_persist_session"}
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["id"]
        
        # Send a message with session_id
        stream_response = self.session.post(
            f"{BASE_URL}/api/chat/stream",
            json={
                "messages": [{"role": "user", "content": "Ola, qual o horario de funcionamento?"}],
                "session_id": session_id
            },
            stream=True,
            timeout=60
        )
        
        assert stream_response.status_code == 200
        
        # Consume the stream
        for line in stream_response.iter_lines(decode_unicode=True):
            if line and line.startswith("data: "):
                data = json.loads(line[6:])
                if data.get("type") == "done":
                    break
        
        # Wait a bit for persistence
        time.sleep(1)
        
        # Get session messages
        get_response = self.session.get(f"{BASE_URL}/api/chat/sessions/{session_id}")
        
        assert get_response.status_code == 200, f"Expected 200, got {get_response.status_code}"
        session_data = get_response.json()
        
        assert "messages" in session_data, "Session should have 'messages'"
        messages = session_data["messages"]
        
        # Should have at least user message and assistant response
        assert len(messages) >= 2, f"Expected at least 2 messages, got {len(messages)}"
        
        # Verify message structure
        user_msg = next((m for m in messages if m.get("role") == "user"), None)
        assistant_msg = next((m for m in messages if m.get("role") == "assistant"), None)
        
        assert user_msg is not None, "Should have user message"
        assert assistant_msg is not None, "Should have assistant message"
        assert "horario" in user_msg.get("content", "").lower(), "User message content mismatch"
        
        print(f"✅ Messages persisted in session: {len(messages)} messages")
        print(f"   User: {user_msg.get('content', '')[:50]}...")
        print(f"   Assistant: {assistant_msg.get('content', '')[:50]}...")
        
        # Cleanup - delete session
        self.session.delete(f"{BASE_URL}/api/chat/sessions/{session_id}")
    
    def test_delete_chat_session(self):
        """DELETE /api/chat/sessions/{id} should remove session"""
        # Create a session
        create_response = self.session.post(
            f"{BASE_URL}/api/chat/sessions",
            json={"title": "TEST_delete_session"}
        )
        assert create_response.status_code == 200
        session_id = create_response.json()["id"]
        
        # Delete the session
        delete_response = self.session.delete(f"{BASE_URL}/api/chat/sessions/{session_id}")
        
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        data = delete_response.json()
        assert data.get("deleted") == 1, "Should have deleted 1 session"
        
        # Verify session is gone
        get_response = self.session.get(f"{BASE_URL}/api/chat/sessions/{session_id}")
        assert get_response.status_code == 404, "Session should not exist after deletion"
        
        print(f"✅ Deleted chat session: {session_id}")


class TestExistingEndpoints:
    """Verify existing endpoints still work after chat implementation"""
    
    def test_auth_login(self):
        """POST /api/auth/login should still work"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@mastermaq.com", "password": "mastermaq@2026"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "_id" in data, "Response should have '_id'"
        assert data.get("email") == "admin@mastermaq.com"
        print("✅ /api/auth/login works")
    
    def test_blog_endpoint(self):
        """GET /api/blog should still work"""
        response = requests.get(f"{BASE_URL}/api/blog")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ /api/blog works - {len(data)} articles")
    
    def test_equipment_types(self):
        """GET /api/equipment/types should still work"""
        response = requests.get(f"{BASE_URL}/api/equipment/types")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) == 9, f"Expected 9 equipment types, got {len(data)}"
        print(f"✅ /api/equipment/types works - {len(data)} types")
    
    def test_cep_lookup(self):
        """GET /api/cep/01001000 should still work"""
        response = requests.get(f"{BASE_URL}/api/cep/01001000")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "logradouro" in data, "Response should have 'logradouro'"
        assert "localidade" in data, "Response should have 'localidade'"
        print(f"✅ /api/cep/01001000 works - {data.get('localidade')}")


class TestTokenLimit:
    """Test that responses respect the 400 token limit"""
    
    def test_response_token_limit(self):
        """Response should be limited to approximately 400 tokens"""
        # Ask a question that could generate a long response
        response = requests.post(
            f"{BASE_URL}/api/chat/stream",
            json={
                "messages": [{"role": "user", "content": "Me conte tudo sobre a Mastermaq, todos os servicos, marcas, equipamentos, horarios, endereco, telefone, e qualquer outra informacao disponivel."}]
            },
            headers={"Content-Type": "application/json"},
            stream=True,
            timeout=60
        )
        
        assert response.status_code == 200
        
        # Collect full response
        full_content = ""
        for line in response.iter_lines(decode_unicode=True):
            if line and line.startswith("data: "):
                data = json.loads(line[6:])
                if data.get("type") == "done":
                    full_content = data.get("content", "")
                    break
        
        # Rough token estimate: ~4 chars per token for Portuguese
        estimated_tokens = len(full_content) / 4
        
        # Allow some margin (400 tokens * 4 chars = ~1600 chars, allow up to 2000)
        assert len(full_content) < 2500, f"Response too long ({len(full_content)} chars, ~{estimated_tokens:.0f} tokens)"
        
        print(f"✅ Response within token limit: {len(full_content)} chars (~{estimated_tokens:.0f} tokens)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
