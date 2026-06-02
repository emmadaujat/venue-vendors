// validation helpers for venue forms (edit venue)

// check venue name field
export function isValidVenueName(name: string) {
  if (!name.trim()) return "Venue name is required";
  return null;
}

// check location field
export function isValidLocation(location: string) {
  if (!location.trim()) return "Location is required";
  return null;
}

// check capacity is a valid number
export function isValidCapacity(capacity: string) {
  if (!capacity) return "Capacity is required";
  if (isNaN(Number(capacity)) || Number(capacity) <= 0) return "Capacity must be a positive number";
  return null;
}

// check price is a valid number
export function isValidPricePerDay(price: string) {
  if (!price) return "Price per day is required";
  if (isNaN(Number(price)) || Number(price) <= 0) return "Price per day must be a positive number";
  return null;
}

// checks description is not empty and within 1000 char limit
export function isValidDescription(description: string) {
  if (!description.trim()) return "Description is required";
  if (description.length > 1000) return "Description cannot exceed 1000 characters";
  return null;
}

// checks image URL is not empty and within 500 char limit
export function isValidImageURL(imageURL: string) {
  if (!imageURL.trim()) return "Image URL is required";
  if (imageURL.length > 500) return "Image URL cannot exceed 500 characters";
  return null;
}
