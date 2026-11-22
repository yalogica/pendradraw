use serde::Serialize;
use std::{
  fs::{self, OpenOptions},
  io::{self, Write},
  path::Path,
};

#[derive(Debug, Serialize)]
#[serde(tag = "code", content = "message", rename_all = "SCREAMING_SNAKE_CASE")]
enum FileCommandError {
  FileNotFound(String),
  Io(String),
}

impl FileCommandError {
  fn from_io(error: io::Error) -> Self {
    Self::Io(error.to_string())
  }
}

#[tauri::command]
fn read_drawing(path: String) -> Result<String, FileCommandError> {
  fs::read_to_string(&path).map_err(|error| {
    if error.kind() == io::ErrorKind::NotFound {
      FileCommandError::FileNotFound(path)
    } else {
      FileCommandError::from_io(error)
    }
  })
}

#[tauri::command]
fn write_drawing(
    path: String,
    contents: String,
    require_existing: bool,
) -> Result<(), FileCommandError> {
  let target = Path::new(&path);

  if require_existing {
    let mut file = OpenOptions::new()
      .write(true)
      .truncate(true)
      .open(target)
      .map_err(|error| {
        if error.kind() == io::ErrorKind::NotFound {
          FileCommandError::FileNotFound(path.clone())
        } else {
          FileCommandError::from_io(error)
        }
      })?;

    return file
      .write_all(contents.as_bytes())
      .map_err(FileCommandError::from_io);
  }

  fs::write(target, contents).map_err(FileCommandError::from_io)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![read_drawing, write_drawing])
    .run(tauri::generate_context!())
    .expect("failed to run PendraDraw");
}
