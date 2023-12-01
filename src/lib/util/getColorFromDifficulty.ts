export default function getColorFromDifficulty(difficulty: string | null) {
    if (difficulty === 'Hard')
        return 'red';
    if (difficulty === 'Medium')
        return 'yellow';
    if (difficulty === 'Easy')
        return 'green';
    return 'gray';
}