use std::error::Error;
use std::fmt::{Display, Formatter};
use std::path::PathBuf;
use std::sync::RwLock;

use serde::{Deserialize, Serialize};

use crate::util;

#[tauri::command]
pub fn get_preferences() -> Preferences {
  PREFERENCES.read().unwrap().data()
}

lazy_static::lazy_static! {
  pub static ref PREFERENCES: RwLock<Preferences> = RwLock::new(Preferences::default());
}

#[derive(Debug)]
pub struct PreferencesError {
  details: String,
}

impl PreferencesError {
  pub fn new(details: String) -> Self {
    PreferencesError { details }
  }
}

impl Display for PreferencesError {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.details)
  }
}

impl Error for PreferencesError {
  fn description(&self) -> &str {
    self.details.as_str()
  }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Preferences {
  lang: String,
  path: PathBuf,
  uid: Option<String>,
  key: Option<String>,
}

impl Preferences {
  pub fn lang(&self) -> &str {
    &self.lang
  }
  pub fn path(&self) -> &str {
    self.path.to_str().expect("failed to convert to string")
  }

  pub fn uid(&self) -> Option<&str> {
    self.uid.as_ref().map(|s| s.as_str())
  }

  pub fn key(&self) -> Option<&str> {
    self.key.as_ref().map(|s| s.as_str())
  }

  pub fn data(&self) -> Self {
    Preferences {
      lang: self.lang.clone(),
      path: self.path.clone(),
      uid: self.uid.clone(),
      key: self.key.clone(),
    }
  }
}

impl Preferences {
  pub fn set_lang(&mut self, lang: String) {
    self.lang = lang;
    self.store();
  }

  pub fn set_path(&mut self, path: PathBuf) {
    self.path = path;
    self.store();
  }

  pub fn set_uid(&mut self, uid: String) {
    self.uid = Some(uid);
    self.store();
  }

  pub fn set_key(&mut self, key: String) {
    self.key = Some(key);
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
    let path = util::data_dir().join(PREFERENCE_FILE);
    path.to_str().expect("error converting to string").to_string()
  }
}

impl Default for Preferences {
  fn default() -> Self {
    Preferences::load().unwrap_or_else(|_| {
      let setting = Preferences {
        lang: "default".to_string(),
        path: util::default_dir(),
        uid: None,
        key: None,
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

