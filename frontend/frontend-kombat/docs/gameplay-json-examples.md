# Gameplay JSON Examples

ตัวอย่าง JSON ที่ Frontend ส่งไปยัง Backend และรูปแบบ JSON ที่คาดว่าจะได้รับกลับมา

## 1) Spawn Minion

**Request**

`POST /api/game/spawn`

```json
{
  "type": "FIGHTER",
  "row": 2,
  "col": 3
}
```

**Response**

```json
{
  "success": true,
  "phase": "PLAYER_ACTION",
  "currentPlayer": 1,
  "turn": 4
}
```

## 2) Buy Hex

**Request**

`POST /api/game/buy-hex`

```json
{
  "row": 2,
  "col": 3
}
```

**Response**

```json
{
  "success": true,
  "phase": "PLAYER_ACTION"
}
```

## 3) Game Status (ใช้กับการแสดง HUD และ HP)

**Request**

`GET /api/game/status`

**Response (ตัวอย่างเฉพาะ field สำคัญ)**

```json
{
  "currentPlayer": 1,
  "gameOver": false,
  "winner": "",
  "gameState": {
    "turnNumber": 4,
    "phase": "PLAYER_ACTION",
    "budget": 12,
    "spawnsLeft": 1,
    "minions": [
      {
        "ownerId": 1,
        "type": "FIGHTER",
        "hp": 85,
        "x": 2,
        "y": 3
      },
      {
        "ownerId": 2,
        "type": "ASSASSIN",
        "hp": 60,
        "x": 6,
        "y": 5
      }
    ]
  },
  "spawnableHexes": [
    { "row": 2, "col": 3, "ownerId": 1 }
  ],
  "buyableHexes": [
    { "row": 1, "col": 2, "ownerId": 0 }
  ],
  "availableTypes": ["FIGHTER", "TANK", "DPS", "ASSASSIN", "SUPPORT"]
}
```

> หมายเหตุ: Frontend รองรับ `hp` ใน `gameState.minions[].hp` แล้ว เพื่อนำไปแสดงหลอดเลือดใน Player Panel
