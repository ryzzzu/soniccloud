# ERD SonicCloud v1.0

```mermaid
erDiagram
    USERS ||--o{ SONGS : uploads
    USERS o|--o{ SONGS : moderates
    GENRES ||--o{ SONGS : categorizes
    USERS ||--o{ PLAYLISTS : owns
    PLAYLISTS ||--o{ PLAYLIST_SONGS : contains
    SONGS ||--o{ PLAYLIST_SONGS : included
    USERS ||--o{ FAVORITES : saves
    SONGS ||--o{ FAVORITES : favorited
    USERS ||--o{ LISTENING_HISTORY : has
    SONGS ||--o{ LISTENING_HISTORY : recorded
```

Tabel inti: `users`, `genres`, `songs`, `playlists`, `playlist_songs`, `favorites`, `listening_history`. Fitur laporan musik tidak termasuk versi pertama.
