# Mock Data Directory

This directory contains mock data files for testing and development purposes. **These files are NOT automatically seeded into the database** - they are used by the application directly for development and testing.

## Files

### `categories.json`
Categories for organizing programs and coaches. *Note: Categories ARE seeded into the database via the seed script.*

### `coaches.json` 
Sample coach profiles with realistic data including:
- Professional backgrounds  
- Specialties and expertise areas
- Ratings and session counts
- Contact information and availability
- All enum values match Prisma schema (e.g., skillLevel: "INTERMEDIATE")

### `programs.json`
Sample coaching programs with:
- Detailed descriptions and pricing
- Modules and objectives
- Category associations  
- Coach assignments
- Proper enum values (difficultyLevel: "BEGINNER", status: "ACTIVE")

### `students.json`
Sample student profiles including:
- Learning goals and interests
- Program preferences and skill levels
- Contact information and preferences
- Proper enum values (skillLevel: "BEGINNER", "INTERMEDIATE", "ADVANCED")

### `reviews.json`
Sample reviews for coaches and programs with:
- Ratings and detailed feedback
- Reviewer information
- Target types (COACH, PROGRAM, SESSION)

### `enrollments.json`
Sample enrollment data linking students to programs with:
- Enrollment status (ACTIVE, COMPLETED, etc.)
- Progress tracking
- Student and program references

## Usage

These files are used for:
- Development UI components without database dependency
- API testing with realistic data structures
- Frontend development and prototyping
- Demo and presentation purposes

## Data Structure

- All data follows the Prisma schema structure defined in `prisma/schema.prisma`
- Enum values match exactly (e.g., "BEGINNER" not "beginner")
- Relationships use proper IDs and references
- All required fields are populated

## Real vs Mock Data

- **Real users** are created through Firebase Auth + API routes
- **Categories** are seeded once via `prisma db seed`
- **Programs, enrollments, etc.** are created by real users through the UI
- **Mock data** is used for development/testing when real data doesn't exist

## Updating Data

When updating mock data:
1. Ensure enum values match Prisma schema exactly
2. Maintain realistic relationships between entities
3. Keep IDs consistent across related files
4. Test with actual API routes to ensure compatibility