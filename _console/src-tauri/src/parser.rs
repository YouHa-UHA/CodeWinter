use std::{collections::BTreeMap, fs, path::Path};

use crate::models::{DocumentSection, KeyValueField};

pub fn read_utf8_file(path: &Path) -> Result<String, String> {
    let raw = fs::read_to_string(path)
        .map_err(|error| format!("Failed to read file {}: {error}", path.display()))?;
    Ok(strip_utf8_bom(raw))
}

pub fn parse_markdown_sections(path: &Path) -> Result<Vec<DocumentSection>, String> {
    let content = read_utf8_file(path)?;
    let mut sections = Vec::new();
    let mut current_title: Option<String> = None;
    let mut current_lines: Vec<String> = Vec::new();

    for raw_line in content.lines() {
        let line = raw_line.trim();
        if let Some(title) = line.strip_prefix("## ") {
            if let Some(previous_title) = current_title.take() {
                sections.push(DocumentSection {
                    title: previous_title,
                    lines: current_lines,
                });
                current_lines = Vec::new();
            }
            current_title = Some(title.trim().to_string());
            continue;
        }

        if current_title.is_none() || line.is_empty() {
            continue;
        }

        if should_skip_section_line(line) {
            continue;
        }

        current_lines.push(line.to_string());
    }

    if let Some(title) = current_title {
        sections.push(DocumentSection {
            title,
            lines: current_lines,
        });
    }

    Ok(sections)
}

pub fn parse_key_value_fields(path: &Path) -> Result<Vec<KeyValueField>, String> {
    let content = read_utf8_file(path)?;
    Ok(extract_key_value_fields_from_text(&content))
}

pub fn parse_field_map(path: &Path) -> Result<BTreeMap<String, String>, String> {
    let fields = parse_key_value_fields(path)?;
    Ok(fields
        .into_iter()
        .map(|field| (field.key, field.value))
        .collect::<BTreeMap<_, _>>())
}

fn should_skip_section_line(line: &str) -> bool {
    matches!(
        line,
        line if line.starts_with("说明")
            || line.starts_with("规则")
            || line.starts_with("推荐")
            || line.starts_with("Notes")
            || line.starts_with("Rules")
            || line.starts_with("Recommended")
    )
}

fn extract_key_value_fields_from_text(content: &str) -> Vec<KeyValueField> {
    content
        .lines()
        .filter_map(parse_key_value_line)
        .map(|(key, value)| KeyValueField { key, value })
        .collect()
}

fn parse_key_value_line(raw_line: &str) -> Option<(String, String)> {
    let line = raw_line.trim();
    let first_tick = line.find('`')?;
    let second_tick = line[first_tick + 1..].find('`')? + first_tick + 1;
    let key = line[first_tick + 1..second_tick].trim();
    if key.is_empty() {
        return None;
    }

    let rest = line[second_tick + 1..].trim();
    let (separator_index, separator_width) = rest
        .char_indices()
        .find_map(|(index, character)| match character {
            ':' | '：' => Some((index, character.len_utf8())),
            _ => None,
        })?;
    let after_separator = rest[separator_index + separator_width..].trim();

    let value = if let Some(stripped) = after_separator.strip_prefix('`') {
        stripped
            .find('`')
            .map(|index| stripped[..index].trim().to_string())
            .unwrap_or_else(|| stripped.trim().to_string())
    } else {
        after_separator.trim().trim_matches('`').to_string()
    };

    Some((key.to_string(), value))
}

fn strip_utf8_bom(value: String) -> String {
    value.strip_prefix('\u{feff}')
        .map(ToOwned::to_owned)
        .unwrap_or(value)
}
