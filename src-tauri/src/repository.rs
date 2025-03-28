use crate::card::Card;
use std::collections::{HashMap, HashSet};
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::PathBuf;
use uuid::Uuid;

pub struct Repository {
    #[allow(dead_code)]
    name: String,
    cards: HashMap<Uuid, Card>,
    file_path: PathBuf,
}

impl Repository {
    pub fn new(directory: PathBuf, name: String) -> Result<Self, Box<dyn std::error::Error>> {
        fs::create_dir_all(&directory)?;
        let file_path = directory.join(&name);

        if file_path.exists() {
            let mut file = File::open(&file_path)?;

            let mut bytes = Vec::new();
            file.read_to_end(&mut bytes)?;

            let cards: HashMap<Uuid, Card> = bincode::deserialize(&bytes)?;

            Ok(Repository {
                name,
                cards,
                file_path,
            })
        } else {
            let repo = Repository {
                name,
                cards: HashMap::new(),
                file_path,
            };

            repo.save()?;

            Ok(repo)
        }
    }

    pub fn save(&self) -> Result<(), Box<dyn std::error::Error>> {
        let bytes = bincode::serialize(&self.cards)?;

        let mut file = File::create(&self.file_path)?;
        file.write_all(&bytes)?;

        Ok(())
    }

    pub fn add_card(
        &mut self,
        title: String,
        tags: HashSet<String>,
        content: String,
    ) -> Result<Card, Box<dyn std::error::Error>> {
        let card = Card::new(title, tags, content);
        let id = card.id;
        self.cards.insert(id, card.clone());

        self.save()?;

        Ok(card)
    }

    pub fn get_card(&self, id: &Uuid) -> Option<&Card> {
        self.cards.get(id)
    }

    pub fn get_all_cards(&self) -> Vec<Card> {
        self.cards.values().cloned().collect()
    }

    pub fn delete_card(&mut self, id: &Uuid) -> Result<bool, Box<dyn std::error::Error>> {
        let existed = self.cards.remove(id).is_some();

        if existed {
            self.save()?;
        }

        Ok(existed)
    }

    pub fn update_card_title(
        &mut self,
        id: &Uuid,
        title: String,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        if let Some(card) = self.cards.get_mut(id) {
            card.update_title(title);
            self.save()?;
            return Ok(true);
        }

        Ok(false)
    }

    pub fn update_card_tags(
        &mut self,
        id: &Uuid,
        tags: HashSet<String>,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        if let Some(card) = self.cards.get_mut(id) {
            card.update_tags(tags);
            self.save()?;
            return Ok(true);
        }

        Ok(false)
    }

    pub fn update_card_content(
        &mut self,
        id: &Uuid,
        content: String,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        if let Some(card) = self.cards.get_mut(id) {
            card.update_content(content);
            self.save()?;
            return Ok(true);
        }

        Ok(false)
    }
}
