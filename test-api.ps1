# Script de prueba de la API de la Tienda desde PowerShell

Write-Host "=== Iniciando pruebas de la API ===" -ForegroundColor Cyan
$baseUrl = "http://localhost:3000"

# 1. Obtener catálogo de productos
Write-Host "`n1. Obteniendo catálogo de productos..." -ForegroundColor Green
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get
    $products | Format-Table id, name, price, stock
} catch {
    Write-Error "Error obteniendo productos: $_"
}

# 2. Agregar un nuevo producto
Write-Host "`n2. Creando nuevo producto..." -ForegroundColor Green
$newProduct = @{
    id = "prod-5"
    name = "Audífonos Inalámbricos Pro"
    description = "Audífonos con cancelación de ruido activa"
    price = 150
    stock = 30
} | ConvertTo-Json

try {
    $createdProduct = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Post -Body $newProduct -ContentType "application/json"
    Write-Host "Producto creado exitosamente:" -ForegroundColor Gray
    $createdProduct | Format-List id, name, price, stock
} catch {
    Write-Error "Error creando producto: $_"
}

# 3. Crear una orden de compra
Write-Host "`n3. Creando orden de compra (comprando Laptop Gamer Pro y el nuevo producto)..." -ForegroundColor Green
$newOrder = @{
    items = @(
        @{ productId = "prod-1"; quantity = 1 },
        @{ productId = "prod-5"; quantity = 2 }
    )
} | ConvertTo-Json

try {
    $createdOrder = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method Post -Body $newOrder -ContentType "application/json"
    Write-Host "Orden creada exitosamente:" -ForegroundColor Gray
    $createdOrder | Format-List id, total, status, createdAt
    Write-Host "Detalle de los items de la orden:" -ForegroundColor Gray
    $createdOrder.items | Format-Table productId, productName, price, quantity
} catch {
    Write-Error "Error creando orden: $_"
}

# 4. Obtener catálogo nuevamente para validar stock disminuido
Write-Host "`n4. Validando actualización de stock en el catálogo..." -ForegroundColor Green
try {
    $productsUpdated = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get
    $productsUpdated | Format-Table id, name, price, stock
} catch {
    Write-Error "Error validando stock: $_"
}

# 5. Listar todas las órdenes creadas
Write-Host "`n5. Obteniendo historial de órdenes..." -ForegroundColor Green
try {
    $orders = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method Get
    $orders | Format-Table id, total, status, createdAt
} catch {
    Write-Error "Error obteniendo órdenes: $_"
}

Write-Host "`n=== Pruebas de la API finalizadas ===" -ForegroundColor Cyan
