use serde::Serialize;
use std::collections::VecDeque;

#[derive(Serialize, Clone)]
pub struct Buffer<T> {
    pub content: VecDeque<T>,
    pub max_length: usize,
}

impl<T> Buffer<T> {
    pub fn new(length: usize) -> Buffer<T> {
        Self {
            content: VecDeque::with_capacity(length),
            max_length: length,
        }
    }

    pub fn push(&mut self, item: T) {
        if self.content.len() == self.max_length {
            self.content.pop_front();
        }
        self.content.push_back(item);
    }
}
