Add-Type -AssemblyName System.Drawing
# Copy clean source first
Copy-Item "c:\Users\RAGHAV\Downloads\Screenshot 2026-08-08 224141.png" "C:\Users\RAGHAV\Downloads\QUIZ\public\badge.png"

$src = [System.Drawing.Bitmap]::FromFile("C:\Users\RAGHAV\Downloads\QUIZ\public\badge.png")
$width = $src.Width
$height = $src.Height

# Bounding box coordinates for the badge
$minX = $width
$maxX = 0
$minY = $height
$maxY = 0

for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $pixel = $src.GetPixel($x, $y)
        # Check if pixel belongs to the yellow/orange badge background or red border
        # Badge Yellow: R > 190, G > 130, B < 100
        # Badge Red: R > 90, G < 70, B < 70
        $isBadge = (($pixel.R -gt 190 -and $pixel.G -gt 130 -and $pixel.B -lt 100) -or ($pixel.R -gt 90 -and $pixel.G -lt 70 -and $pixel.B -lt 70))
        
        if ($isBadge) {
            # Skip the top-left yellow diagonal line (located roughly at X < 120 and Y < 120)
            if ($x -lt 120 -and $y -lt 120) {
                continue
            }
            # Skip the right black bar
            if ($x -gt ($width - 15)) {
                continue
            }
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

# Add a safety margin of 2 pixels around the detected badge circle
$margin = 2
$minX = [Math]::Max(0, $minX - $margin)
$minY = [Math]::Max(0, $minY - $margin)
$maxX = [Math]::Min($width - 1, $maxX + $margin)
$maxY = [Math]::Min($height - 1, $maxY + $margin)

$boxWidth = $maxX - $minX
$boxHeight = $maxY - $minY

Write-Output "Detected Badge Bounding Box: X=[$minX, $maxX] W=$boxWidth, Y=[$minY, $maxY] H=$boxHeight"

if ($boxWidth -gt 50 -and $boxHeight -gt 50) {
    # Crop to a square containing the badge
    $size = [Math]::Max($boxWidth, $boxHeight)
    $dest = new-object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    
    # Fill transparent or white background
    $g.Clear([System.Drawing.Color]::White)

    $srcRect = new-object System.Drawing.Rectangle($minX, $minY, $boxWidth, $boxHeight)
    $destRect = new-object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    $src.Dispose()
    $g.Dispose()

    # Overwrite public/badge.png
    $dest.Save("C:\Users\RAGHAV\Downloads\QUIZ\public\badge.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()

    Write-Output "Successfully cropped and saved centered badge.png!"
} else {
    $src.Dispose()
    Write-Output "Error: Failed to find valid badge boundaries."
}
