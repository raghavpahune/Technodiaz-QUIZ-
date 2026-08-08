Add-Type -AssemblyName System.Drawing
# We must copy from backup or re-read original first
# Let's restore the original badge from Downloads folder to make sure we crop from the clean source
Copy-Item "c:\Users\RAGHAV\Downloads\WhatsApp Image 2026-08-08 at 10.10.13 PM.jpeg" "C:\Users\RAGHAV\Downloads\QUIZ\public\badge.jpeg"

$src = [System.Drawing.Bitmap]::FromFile("C:\Users\RAGHAV\Downloads\QUIZ\public\badge.jpeg")

# Center is (800, 600) for a 1600x1200 image.
# We crop a 1160x1160 square to remove the off-center edges.
$size = 1160
$minX = 220
$minY = 20

Write-Output "Cropping center square at X=$minX, Y=$minY, Size=$size"

$dest = new-object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($dest)
$g.Clear([System.Drawing.Color]::White)

$srcRect = new-object System.Drawing.Rectangle($minX, $minY, $size, $size)
$destRect = new-object System.Drawing.Rectangle(0, 0, $size, $size)
$g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$src.Dispose()
$g.Dispose()

# Save and overwrite badge.jpeg
$dest.Save("C:\Users\RAGHAV\Downloads\QUIZ\public\badge.jpeg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$dest.Dispose()

Write-Output "Successfully cropped and saved center badge!"
