use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Card {
    pub id: Uuid,
    pub title: String,
    pub tags: HashSet<String>,
    pub content: String,
    pub created_at: i64,
    pub updated_at: i64,
}

impl Card {
    pub fn new(title: String, tags: HashSet<String>, content: String) -> Self {
        let now = Utc::now().timestamp_millis();
        let id = Uuid::new_v4();

        Card {
            id,
            title,
            tags,
            content,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn update_title(&mut self, title: String) {
        self.title = title;
        self.updated_at = Utc::now().timestamp_millis();
    }

    pub fn update_tags(&mut self, tags: HashSet<String>) {
        self.tags = tags;
        self.updated_at = Utc::now().timestamp_millis();
    }

    pub fn update_content(&mut self, content: String) {
        self.content = content;
        self.updated_at = Utc::now().timestamp_millis();
    }
}
