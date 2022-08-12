use std::{sync::RwLock, error::Error};
use chrono::{DateTime, Utc};
use crate::{util, preferences::{PREFERENCES, self}};

use serde::{Deserialize, Serialize};
use reqwest::{Client, Url};

lazy_static::lazy_static! {
    pub static ref ESTUARY: RwLock<Estuary> = RwLock::new(Estuary::default());
}

lazy_static::lazy_static! {
    pub static ref CLIENT: Client = Client::new();
}

#[derive(Debug, Serialize, Deserialize)]
struct CollectionAPIResponse {
    uuid: String,
}

#[tauri::command]
pub async fn generate_uid(window: tauri::Window) {
    if PREFERENCES.read().unwrap().uid().is_none() {
        let result = generate_uid_helper().await.expect("could not generate uid");
        PREFERENCES.write().unwrap().set_uid(result);
        window.emit("updated:preferences", &preferences::get_preferences()).expect("failed to emit updated:preferences");
    }
}

pub async fn generate_uid_helper() -> Result<String, Box<dyn Error>> {
    let result = CLIENT.post("https://api.estuary.tech/collections/create")
    .header("Authorization", format!("Bearer {}", ESTUARY.read().unwrap().token().unwrap()))
    .body("{\"name\":\"A new collection\",\"description\":\"A new collection test\"}")
    .send().await?
    .json::<CollectionAPIResponse>().await?;
    Ok(result.uuid)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Estuary {
    token: Option<String>,
    expiry: Option<String>,
}

impl Estuary {
    pub fn token(&self) -> Option<&str> {
        self.token.as_ref().map(|s| s.as_str())
    }
    
    pub fn expiry(&self) -> Option<&str> {
        self.expiry.as_ref().map(|s| s.as_str())
    }
}

impl Estuary {
    pub async fn update(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        if self.is_expired() {
            let body = reqwest::get("https://www.anthonyriley.org/api/estuary")
            .await?
            .json::<Estuary>()
            .await?;
            self.token = body.token;
            self.expiry = body.expiry;
            self.store();
        }
        Ok(())
    }

    fn expiration_date(&self) -> DateTime<Utc> {
        let expiration = self.expiry().unwrap_or("2000-01-01T21:26:56.567895008Z");
        DateTime::parse_from_rfc3339(expiration).expect("invalid expiry").with_timezone(&Utc)
    }

    fn is_expired(&self) -> bool {
        Utc::now().naive_utc() > self.expiration_date().naive_utc()
    }
}

const PREFERENCE_FILE: &'static str = "estuary.config";

impl Estuary {
  fn store(&self) {
    let path = Estuary::build_conf_path();
    let contents = serde_json::to_string_pretty(self).unwrap();
    let _ = std::fs::write(path, contents);
  }

  fn load() -> std::result::Result<Estuary, Box<dyn Error>> {
    let path = Estuary::build_conf_path();
    let string = std::fs::read_to_string(path)?;
    serde_json::from_str(&string).map_err(|x| x.to_string().into())
  }

  fn build_conf_path() -> String {
    let path = util::app_config_dir().join(PREFERENCE_FILE);
    path.to_str().expect("error converting to string").to_string()
  }
}

impl Default for Estuary {
  fn default() -> Self {
    Estuary::load().unwrap_or_else(|_| {
        Estuary {
            token: None,
            expiry: None,
        }
    })
  }
}