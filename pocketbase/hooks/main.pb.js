// PocketBase hooks for DrawDB
// This file contains server-side logic for handling DrawDB-specific operations

// Hook that runs before creating a diagram
onRecordBeforeCreateRequest((e) => {
  // Set owner to the authenticated user
  if (e.collection.name === "diagrams") {
    if (e.auth && e.auth.id) {
      e.record.set("owner", e.auth.id)
    }
  }
}, "diagrams")

// Hook that runs before creating a gist  
onRecordBeforeCreateRequest((e) => {
  // Set owner to the authenticated user
  if (e.collection.name === "gists") {
    if (e.auth && e.auth.id) {
      e.record.set("owner", e.auth.id)
    }
    
    // Generate a unique gist ID if not provided
    if (!e.record.get("gist_id")) {
      const timestamp = new Date().getTime()
      const randomId = Math.random().toString(36).substring(2, 15)
      e.record.set("gist_id", `drawdb-${timestamp}-${randomId}`)
    }
  }
}, "gists")

// Hook for updating diagram last_accessed timestamp
onRecordAfterFindFirstRequest((e) => {
  if (e.collection.name === "diagrams" && e.record) {
    // Update last_accessed timestamp
    try {
      const record = e.record
      record.set("last_accessed", new Date().toISOString())
      $app.dao().saveRecord(record)
    } catch (err) {
      console.log("Error updating last_accessed:", err)
    }
  }
}, "diagrams")

// Custom API routes for DrawDB compatibility

// Email sending endpoint (mock implementation)
routerAdd("POST", "/api/email/send", (c) => {
  const data = c.bind({})
  
  // Mock email sending - in production you'd integrate with actual email service
  console.log("Email send request:", JSON.stringify(data, null, 2))
  
  // Simulate email sending delay
  setTimeout(() => {
    console.log("Mock email sent successfully")
  }, 1000)
  
  return c.json(200, {
    "success": true,
    "message": "Email sent successfully",
    "messageId": `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  })
})

// GitHub Gists API endpoints
routerAdd("POST", "/api/gists", (c) => {
  const data = c.bind({})
  const auth = c.get("auth")
  
  try {
    // Create a new gist record
    const collection = $app.dao().findCollectionByNameOrId("gists")
    const record = new Record(collection)
    
    const gistId = `drawdb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    record.set("gist_id", gistId)
    record.set("title", data.description || "drawDB diagram")
    record.set("content", data.content)
    record.set("is_public", data.public || false)
    
    if (auth && auth.id) {
      record.set("owner", auth.id)
    }
    
    $app.dao().saveRecord(record)
    
    return c.json(201, {
      "success": true,
      "data": {
        "id": gistId,
        "html_url": `http://localhost:8090/gists/${gistId}`,
        "files": {
          [data.filename || "share.json"]: {
            "content": data.content
          }
        },
        "public": data.public || false,
        "description": data.description || "drawDB diagram",
        "created_at": record.get("created"),
        "updated_at": record.get("updated")
      }
    })
  } catch (err) {
    console.log("Gist creation error:", err)
    return c.json(500, {
      "success": false,
      "message": "Failed to create gist",
      "error": err.message
    })
  }
})

routerAdd("PATCH", "/api/gists/:gistId", (c) => {
  const gistId = c.pathParam("gistId")
  const data = c.bind({})
  const auth = c.get("auth")
  
  try {
    // Find the gist record
    const record = $app.dao().findFirstRecordByFilter("gists", `gist_id = {:gistId}`, {
      "gistId": gistId
    })
    
    // Check ownership
    if (auth && auth.id && record.get("owner") !== auth.id) {
      return c.json(403, {
        "success": false,
        "message": "Access denied"
      })
    }
    
    // Update the gist
    if (data.content) {
      record.set("content", data.content)
    }
    
    $app.dao().saveRecord(record)
    
    return c.json(200, {
      "success": true,
      "data": {
        "id": gistId,
        "html_url": `http://localhost:8090/gists/${gistId}`,
        "files": {
          [data.filename || "share.json"]: {
            "content": data.content
          }
        },
        "updated_at": record.get("updated")
      }
    })
  } catch (err) {
    return c.json(404, {
      "success": false,
      "message": "Gist not found",
      "error": err.message
    })
  }
})

routerAdd("DELETE", "/api/gists/:gistId", (c) => {
  const gistId = c.pathParam("gistId")
  const auth = c.get("auth")
  
  try {
    const record = $app.dao().findFirstRecordByFilter("gists", `gist_id = {:gistId}`, {
      "gistId": gistId
    })
    
    // Check ownership
    if (auth && auth.id && record.get("owner") !== auth.id) {
      return c.json(403, {
        "success": false,
        "message": "Access denied"
      })
    }
    
    $app.dao().deleteRecord(record)
    
    return c.json(204, null)
  } catch (err) {
    return c.json(404, {
      "success": false,
      "message": "Gist not found"
    })
  }
})

routerAdd("GET", "/api/gists/:gistId", (c) => {
  const gistId = c.pathParam("gistId")
  
  try {
    const record = $app.dao().findFirstRecordByFilter("gists", `gist_id = {:gistId}`, {
      "gistId": gistId
    })
    
    return c.json(200, {
      "id": gistId,
      "html_url": `http://localhost:8090/gists/${gistId}`,
      "files": {
        "share.json": {
          "content": record.get("content")
        }
      },
      "public": record.get("is_public"),
      "description": record.get("title") || "drawDB diagram",
      "created_at": record.get("created"),
      "updated_at": record.get("updated")
    })
  } catch (err) {
    return c.json(404, {
      "success": false,
      "message": "Gist not found"
    })
  }
})

// Health check endpoint
routerAdd("GET", "/api/health", (c) => {
  return c.json(200, {
    "status": "OK",
    "timestamp": new Date().toISOString(),
    "service": "drawdb-pocketbase",
    "version": "1.0.0"
  })
})