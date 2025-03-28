mod card;
mod repository;

use card::Card;
use repository::Repository;
use std::collections::HashSet;
use std::sync::Mutex;
use tauri::{Manager, State};
use uuid::Uuid;

struct AppState {
    repository: Mutex<Repository>,
}

#[tauri::command]
fn get_all_cards(state: State<AppState>) -> Result<Vec<Card>, String> {
    let repo = state.repository.lock().map_err(|e| e.to_string())?;
    Ok(repo.get_all_cards())
}

#[tauri::command]
fn get_card(id: String, state: State<AppState>) -> Result<Option<Card>, String> {
    let uuid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    let repo = state.repository.lock().map_err(|e| e.to_string())?;
    Ok(repo.get_card(&uuid).cloned())
}

#[tauri::command]
fn add_card(
    title: String,
    tags: Vec<String>,
    content: String,
    state: State<AppState>,
) -> Result<Card, String> {
    let tags_set: HashSet<String> = tags.into_iter().collect();
    let mut repo = state.repository.lock().map_err(|e| e.to_string())?;
    repo.add_card(title, tags_set, content)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_card(id: String, state: State<AppState>) -> Result<bool, String> {
    let uuid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    let mut repo = state.repository.lock().map_err(|e| e.to_string())?;
    repo.delete_card(&uuid).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_card_title(id: String, title: String, state: State<AppState>) -> Result<bool, String> {
    let uuid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    let mut repo = state.repository.lock().map_err(|e| e.to_string())?;
    repo.update_card_title(&uuid, title)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn update_card_tags(id: String, tags: Vec<String>, state: State<AppState>) -> Result<bool, String> {
    let uuid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    let tags_set: HashSet<String> = tags.into_iter().collect();
    let mut repo = state.repository.lock().map_err(|e| e.to_string())?;
    repo.update_card_tags(&uuid, tags_set)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn update_card_content(
    id: String,
    content: String,
    state: State<AppState>,
) -> Result<bool, String> {
    let uuid = Uuid::parse_str(&id).map_err(|e| e.to_string())?;
    let mut repo = state.repository.lock().map_err(|e| e.to_string())?;
    repo.update_card_content(&uuid, content)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let repository_dir = app.path().app_cache_dir().unwrap();
            let repository = Repository::new(repository_dir, "default".to_string())
                .expect("Failed to initialize repository");

            app.manage(AppState {
                repository: Mutex::new(repository),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_all_cards,
            get_card,
            add_card,
            delete_card,
            update_card_title,
            update_card_tags,
            update_card_content,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
