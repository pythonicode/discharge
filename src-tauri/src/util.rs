use std::path::PathBuf;
use tauri::{api::path};

const APP_NAME: &str = "discharge";

pub fn default_dir() -> PathBuf {
    let path = data_dir();
    path.join("files")
}

pub fn data_dir() -> PathBuf {
    let path = path::config_dir().expect("could not get config dir");
    path.join(APP_NAME)
}
