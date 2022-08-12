use std::error::Error;
use std::fmt::{Display, Formatter};
use std::sync::RwLock;

use serde::{Deserialize, Serialize};

use crate::util;
use crate::estuary;

#[tauri::command]
pub fn get_preferences() -> Preferences {
  PREFERENCES.read().unwrap().data()
}

#[tauri::command]
pub fn set_lang(lang: String, window: tauri::Window) -> Result<(), tauri::Error> {
  PREFERENCES.write().unwrap().set_lang(lang);
  window.emit("updated:preferences", &get_preferences())
}

#[tauri::command]
pub fn set_path(path: String, window: tauri::Window) -> Result<(), tauri::Error> {
  PREFERENCES.write().unwrap().set_path(path);
  window.emit("updated:preferences", &get_preferences())
}

#[tauri::command]
pub fn set_uid(uid: String, window: tauri::Window) -> Result<(), tauri::Error> {
  PREFERENCES.write().unwrap().set_lang(uid);
  window.emit("updated:preferences", &get_preferences())
}

#[tauri::command]
pub fn set_password(password: String, window: tauri::Window) -> Result<(), tauri::Error> {
  PREFERENCES.write().unwrap().set_password(password);
  window.emit("updated:preferences", &get_preferences())
  
}

#[tauri::command]
pub fn remove_account(window: tauri::Window) -> Result<(), tauri::Error> {
  PREFERENCES.write().unwrap().remove_account();
  window.emit("updated:preferences", &get_preferences())
}

lazy_static::lazy_static! {
  pub static ref PREFERENCES: RwLock<Preferences> = RwLock::new(Preferences::default());
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Preferences {
  lang: String,
  path: String,
  uid: Option<String>,
  password: Option<String>,
}

impl Preferences {
  pub fn lang(&self) -> &str {
    &self.lang
  }

  pub fn path(&self) -> &str {
    &self.path
  }

  pub fn uid(&self) -> Option<&str> {
    self.uid.as_ref().map(|s| s.as_str())
  }

  pub fn password(&self) -> Option<&str> {
    self.password.as_ref().map(|s| s.as_str())
  }


  pub fn data(&self) -> Self {
    Preferences {
      lang: self.lang.clone(),
      path: self.path.clone(),
      uid: self.uid.clone(),
      password: self.password.clone(),
    }
  }
}

impl Preferences {
  pub fn set_lang(&mut self, lang: String) {
    self.lang = lang;
    self.store();
  }

  pub fn set_path(&mut self, path: String) {
    self.path = path;
    self.store();
  }

  pub fn set_uid(&mut self, uid: String) {
    self.uid = Some(uid);
    self.store();
  }

  pub fn set_password(&mut self, password: String) {
    self.password = Some(password);
    self.store();
  }

  pub fn remove_account(&mut self) {
    self.uid = None;
    self.password = None;
    self.store();
  }
}

const PREFERENCE_FILE: &'static str = "preferences.config";

impl Preferences {
  fn store(&self) {
    let path = Preferences::build_conf_path();
    let contents = serde_json::to_string_pretty(self).unwrap();
    let _ = std::fs::write(path, contents);
  }

  fn load() -> std::result::Result<Preferences, Box<dyn Error>> {
    let path = Preferences::build_conf_path();
    let string = std::fs::read_to_string(path)?;
    serde_json::from_str(&string).map_err(|x| x.to_string().into())
  }

  fn build_conf_path() -> String {
    let path = util::app_config_dir().join(PREFERENCE_FILE);
    path.to_str().expect("error converting to string").to_string()
  }
}

impl Default for Preferences {
  fn default() -> Self {
    Preferences::load().unwrap_or_else(|_| {
      let setting = Preferences {
        lang: "default".to_string(),
        path: util::default_dir().to_str().unwrap().to_string(),
        uid: None,
        password: None,
      };
      setting.store();
      setting
    })
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn t1() {
    let setting = Preferences::default();
    // let string = "zh".into();
    // setting.set_lang(string);
    // setting.set_theme("dark".to_string());
    // let mut x = HashMap::new();
    // x.insert("hello".to_string(), "world".to_string());
    // setting.set_ext(x);
    println!("{:?}", setting);
  }
}

