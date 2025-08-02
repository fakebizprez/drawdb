// Initial DrawDB PocketBase setup
// This creates the basic collections for drawDB

migrate((db) => {
  // Create users collection (PocketBase auth collection)
  const usersCollection = new Collection({
    "id": "users",
    "created": "2024-01-01 00:00:00.000Z",
    "updated": "2024-01-01 00:00:00.000Z",
    "name": "users",
    "type": "auth",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "username",
        "name": "username",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "name",
        "name": "name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "avatar",
        "name": "avatar",
        "type": "file",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "mimeTypes": [
            "image/jpeg",
            "image/png",
            "image/svg+xml",
            "image/gif",
            "image/webp"
          ],
          "thumbs": null,
          "maxSelect": 1,
          "maxSize": 5242880,
          "protected": false
        }
      }
    ],
    "indexes": [],
    "listRule": "id = @request.auth.id",
    "viewRule": "id = @request.auth.id",
    "createRule": "",
    "updateRule": "id = @request.auth.id",
    "deleteRule": "id = @request.auth.id",
    "options": {
      "allowEmailAuth": true,
      "allowOAuth2Auth": true,
      "allowUsernameAuth": true,
      "exceptEmailDomains": null,
      "manageRule": null,
      "minPasswordLength": 8,
      "onlyEmailDomains": null,
      "onlyVerified": false,
      "requireEmail": false
    }
  })

  return Dao(db).saveCollection(usersCollection)
}, (db) => {
  return Dao(db).deleteCollection(findCollectionByNameOrId(db, "users"))
})

// Create diagrams collection
migrate((db) => {
  const collection = new Collection({
    "id": "diagrams",
    "created": "2024-01-01 00:00:00.000Z", 
    "updated": "2024-01-01 00:00:00.000Z",
    "name": "diagrams",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "title",
        "name": "title", 
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": 255,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "description",
        "name": "description",
        "type": "text", 
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 1000,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "data",
        "name": "data",
        "type": "json",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "system": false, 
        "id": "owner",
        "name": "owner",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "users",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "is_public",
        "name": "is_public", 
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "tags",
        "name": "tags",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE INDEX idx_diagrams_owner ON diagrams (owner)",
      "CREATE INDEX idx_diagrams_public ON diagrams (is_public) WHERE is_public = TRUE",
      "CREATE INDEX idx_diagrams_created ON diagrams (created)"
    ],
    "listRule": "owner = @request.auth.id || is_public = true",
    "viewRule": "owner = @request.auth.id || is_public = true", 
    "createRule": "@request.auth.id != \"\"",
    "updateRule": "owner = @request.auth.id",
    "deleteRule": "owner = @request.auth.id",
    "options": {}
  })

  return Dao(db).saveCollection(collection)
}, (db) => {
  return Dao(db).deleteCollection(findCollectionByNameOrId(db, "diagrams"))
})

// Create gists collection for GitHub gist integration
migrate((db) => {
  const collection = new Collection({
    "id": "gists",
    "created": "2024-01-01 00:00:00.000Z",
    "updated": "2024-01-01 00:00:00.000Z", 
    "name": "gists",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "gist_id",
        "name": "gist_id",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": true,
        "options": {
          "min": null,
          "max": 255,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "github_gist_id", 
        "name": "github_gist_id",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 255,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "title",
        "name": "title",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 255,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "content",
        "name": "content", 
        "type": "json",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "system": false,
        "id": "owner",
        "name": "owner",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "users",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "is_public",
        "name": "is_public",
        "type": "bool", 
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [
      "CREATE INDEX idx_gists_owner ON gists (owner)",
      "CREATE INDEX idx_gists_gist_id ON gists (gist_id)"
    ],
    "listRule": "owner = @request.auth.id || is_public = true",
    "viewRule": "owner = @request.auth.id || is_public = true",
    "createRule": "@request.auth.id != \"\"",
    "updateRule": "owner = @request.auth.id", 
    "deleteRule": "owner = @request.auth.id",
    "options": {}
  })

  return Dao(db).saveCollection(collection)
}, (db) => {
  return Dao(db).deleteCollection(findCollectionByNameOrId(db, "gists"))
})