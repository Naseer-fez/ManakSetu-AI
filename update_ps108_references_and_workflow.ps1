$ErrorActionPreference = 'Stop'

$sourcePath = 'D:\CODE\Hackathon\output\PS108_animated.pptx'
$outputDirectory = 'D:\CODE\Hackathon\output'
$outputPath = Join-Path $outputDirectory 'PS108_references_workflow_v3.pptx'
$assetDirectory = 'D:\CODE\Hackathon\.ppt-assets\fa-svg'

if (Test-Path -LiteralPath $outputPath) {
    throw "Refusing to overwrite an existing output: $outputPath"
}

function To-OleColor {
    param([int] $Red, [int] $Green, [int] $Blue)
    return [System.Drawing.ColorTranslator]::ToOle([System.Drawing.Color]::FromArgb($Red, $Green, $Blue))
}

function Set-CellText {
    param(
        [Parameter(Mandatory = $true)] $Cell,
        [Parameter(Mandatory = $true)] [string] $Text,
        [string] $Url,
        [int] $FontSize = 14,
        [bool] $Bold = $false,
        [int] $Color = 0
    )

    $range = $Cell.Shape.TextFrame.TextRange
    $range.Text = $Text
    $range.Font.Name = 'Times New Roman'
    $range.Font.Size = $FontSize
    $range.Font.Bold = if ($Bold) { -1 } else { 0 }
    $range.Font.Color.RGB = $Color
    $range.Font.Underline = 0
    if ($Url) {
        $range.Font.Underline = -1
        $range.ActionSettings.Item(1).Hyperlink.Address = $Url
    }
}

function Add-Component {
    param(
        [Parameter(Mandatory = $true)] $Slide,
        [double] $Left,
        [double] $Top,
        [double] $Width,
        [double] $Height,
        [Parameter(Mandatory = $true)] [string] $Label,
        [Parameter(Mandatory = $true)] [string] $IconPath,
        [int] $FillColor,
        [int] $LineColor,
        [int] $TextColor
    )

    $box = $Slide.Shapes.AddShape(5, $Left, $Top, $Width, $Height)
    $box.Fill.ForeColor.RGB = $FillColor
    $box.Line.ForeColor.RGB = $LineColor
    $box.Line.Weight = 1.25
    $box.TextFrame.MarginLeft = 40
    $box.TextFrame.MarginRight = 8
    $box.TextFrame.MarginTop = 0
    $box.TextFrame.MarginBottom = 0
    $box.TextFrame.VerticalAnchor = 3
    $box.TextFrame.TextRange.Text = $Label
    $box.TextFrame.TextRange.Font.Name = 'Times New Roman'
    $box.TextFrame.TextRange.Font.Size = 13
    $box.TextFrame.TextRange.Font.Bold = -1
    $box.TextFrame.TextRange.Font.Color.RGB = $TextColor
    $box.TextFrame.TextRange.ParagraphFormat.Alignment = 1

    $icon = $Slide.Shapes.AddPicture($IconPath, $false, $true, $Left + 11, $Top + (($Height - 22) / 2), 22, 22)
    return @($box, $icon)
}

function Add-DownArrow {
    param([Parameter(Mandatory = $true)] $Slide, [double] $CenterX, [double] $Top, [int] $Color)
    $line = $Slide.Shapes.AddConnector(1, $CenterX, $Top, $CenterX, $Top + 15)
    $line.Line.ForeColor.RGB = $Color
    $line.Line.Weight = 1.35
    $line.Line.EndArrowheadStyle = 3
    return $line
}

function Add-FadeEffect {
    param(
        [Parameter(Mandatory = $true)] $Sequence,
        [Parameter(Mandatory = $true)] $Shape,
        [Parameter(Mandatory = $true)] [int] $Trigger
    )
    $effect = $Sequence.AddEffect($Shape, 10, 0, $Trigger, $Sequence.Count + 1)
    $effect.Timing.Duration = 0.3
}

function Set-SpeakerNotes {
    param([Parameter(Mandatory = $true)] $Slide, [Parameter(Mandatory = $true)] [string] $Text)
    foreach ($shape in $Slide.NotesPage.Shapes) {
        try {
            if ($shape.PlaceholderFormat.Type -eq 2) {
                $shape.TextFrame.TextRange.Text = $Text
                return
            }
        }
        catch {
            continue
        }
    }
}

$darkBlue = To-OleColor 31 78 121
$mediumBlue = To-OleColor 79 129 189
$lightBlue = To-OleColor 234 242 248
$softGray = To-OleColor 246 248 251
$linkBlue = To-OleColor 0 0 238
$white = To-OleColor 255 255 255

Copy-Item -LiteralPath $sourcePath -Destination $outputPath
$ppt = $null
$deck = $null

try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $deck = $ppt.Presentations.Open($outputPath, $false, $false, $false)

    # Complete the existing reference table with source names, visible link labels, and click-through URLs.
    $referencesSlide = $deck.Slides.Item(6)
    $table = $referencesSlide.Shapes.Item('Table 3').Table
    Set-CellText $table.Cell(1, 1) 'SOURCE' '' 16 $true $white
    Set-CellText $table.Cell(1, 2) 'LINK' '' 16 $true $white
    $referenceRows = @(
        @('BIS Standards Portal', 'standards.bis.gov.in', 'https://standards.bis.gov.in/'),
        @('BIS Quality Control Orders', 'bis.gov.in/QCO-guidance', 'https://www.bis.gov.in/wp-content/uploads/2021/08/Guidance-Document-on-Quality-Control-Orders-QCOs.pdf'),
        @('Government e-Marketplace', 'gem.gov.in', 'https://gem.gov.in/'),
        @('Sentence Transformers CrossEncoder', 'sbert.net/cross-encoder', 'https://www.sbert.net/docs/cross_encoder/usage/usage.html'),
        @('Chroma Documentation', 'docs.trychroma.com', 'https://docs.trychroma.com/')
    )
    for ($row = 0; $row -lt $referenceRows.Count; $row++) {
        Set-CellText $table.Cell($row + 2, 1) $referenceRows[$row][0] '' 13 $true $darkBlue
        Set-CellText $table.Cell($row + 2, 2) $referenceRows[$row][1] $referenceRows[$row][2] 12 $false $linkBlue
    }
    Set-SpeakerNotes $referencesSlide @'
Sources cited in the table:
1. BIS Standards Portal: https://standards.bis.gov.in/
2. BIS Quality Control Orders Guidance: https://www.bis.gov.in/wp-content/uploads/2021/08/Guidance-Document-on-Quality-Control-Orders-QCOs.pdf
3. Government e-Marketplace: https://gem.gov.in/
4. Sentence Transformers CrossEncoder documentation: https://www.sbert.net/docs/cross_encoder/usage/usage.html
5. Chroma Documentation: https://docs.trychroma.com/
'@

    # Duplicate the problem-and-solution slide structure, then rebuild the content area as an editable component library.
    $slide7 = $deck.Slides.Item(2).Duplicate().Item(1)
    $slide7.MoveTo(7)
    for ($index = $slide7.TimeLine.MainSequence.Count; $index -ge 1; $index--) {
        $slide7.TimeLine.MainSequence.Item($index).Delete()
    }
    for ($index = $slide7.Shapes.Count; $index -ge 1; $index--) {
        $shape = $slide7.Shapes.Item($index)
        if ($shape.Top -ge 95 -and $shape.Top -lt 490) {
            $shape.Delete()
        }
    }

    $title = $null
    $pageNumber = $null
    foreach ($shape in $slide7.Shapes) {
        if ($shape.Top -lt 95 -and $shape.Width -gt 800) { $title = $shape }
        if ($shape.Top -ge 490 -and $shape.Left -gt 600 -and $shape.HasTextFrame -eq -1) { $pageNumber = $shape }
    }
    if ($null -eq $title -or $null -eq $pageNumber) {
        throw 'Could not locate the duplicated title or page number on slide 7.'
    }
    $title.TextFrame.TextRange.Text = "BIS-SpecAI`r`nCustomizable Procurement Workflow"
    $title.TextFrame.TextRange.Font.Name = 'Arial'
    $title.TextFrame.TextRange.Font.Color.RGB = $darkBlue
    $title.TextFrame.TextRange.Font.Bold = -1
    $title.TextFrame.TextRange.Paragraphs(1).Font.Size = 27
    $title.TextFrame.TextRange.Paragraphs(2).Font.Size = 19
    $title.TextFrame.TextRange.Paragraphs(2).ParagraphFormat.Alignment = 2
    $pageNumber.TextFrame.TextRange.Text = '7'
    $slide7.Shapes.Item('Google Shape;105;p14').ZOrder(0)
    $slide7.Shapes.Item('Google Shape;106;p14').ZOrder(0)

    $headers = @(
        @{ Text = 'INPUT COMPONENTS'; Left = 28; Width = 258 },
        @{ Text = 'WORKFLOW COMPONENTS'; Left = 351; Width = 258 },
        @{ Text = 'OUTPUT COMPONENTS'; Left = 674; Width = 258 }
    )
    foreach ($header in $headers) {
        $heading = $slide7.Shapes.AddTextbox(1, $header.Left, 98, $header.Width, 25)
        $heading.TextFrame.TextRange.Text = $header.Text
        $heading.TextFrame.TextRange.Font.Name = 'Oswald'
        $heading.TextFrame.TextRange.Font.Size = 19
        $heading.TextFrame.TextRange.Font.Bold = -1
        $heading.TextFrame.TextRange.Font.Color.RGB = $mediumBlue
        $heading.TextFrame.TextRange.ParagraphFormat.Alignment = 2
    }

    $fileIcon = Join-Path $assetDirectory 'file-arrow-up.svg'
    $searchIcon = Join-Path $assetDirectory 'magnifying-glass.svg'
    $graphIcon = Join-Path $assetDirectory 'diagram-project.svg'
    $shieldIcon = Join-Path $assetDirectory 'shield-halved.svg'
    $outputIcon = Join-Path $assetDirectory 'file-circle-check.svg'

    $leftItems = @()
    $leftItems += ,(Add-Component $slide7 28 142 258 54 'Tender specification' $fileIcon $softGray $mediumBlue $darkBlue)
    $leftItems += ,(Add-Component $slide7 28 220 258 54 'Supporting documents' $fileIcon $lightBlue $mediumBlue $darkBlue)
    $leftItems += ,(Add-Component $slide7 28 298 258 54 'Language and query options' $searchIcon $softGray $mediumBlue $darkBlue)

    $centerItems = @()
    $centerItems += ,(Add-Component $slide7 351 134 258 48 'Document parsing' $fileIcon $lightBlue $mediumBlue $darkBlue)
    $centerItems += ,(Add-Component $slide7 351 202 258 48 'Hybrid retrieval' $searchIcon $softGray $mediumBlue $darkBlue)
    $centerItems += ,(Add-Component $slide7 351 270 258 48 'Normative reference graph' $graphIcon $lightBlue $mediumBlue $darkBlue)
    $centerItems += ,(Add-Component $slide7 351 338 258 48 'QCO compliance check' $shieldIcon $softGray $mediumBlue $darkBlue)

    $rightItems = @()
    $rightItems += ,(Add-Component $slide7 674 142 258 54 'Applicable Indian Standards' $outputIcon $softGray $mediumBlue $darkBlue)
    $rightItems += ,(Add-Component $slide7 674 220 258 54 'Compliance verdict' $shieldIcon $lightBlue $mediumBlue $darkBlue)
    $rightItems += ,(Add-Component $slide7 674 298 258 54 'GeM-ready tender clause' $outputIcon $softGray $mediumBlue $darkBlue)

    foreach ($centerY in @(196, 264, 332)) { Add-DownArrow $slide7 480 $centerY $mediumBlue | Out-Null }
    foreach ($centerY in @(208, 286)) { Add-DownArrow $slide7 157 $centerY $mediumBlue | Out-Null }
    foreach ($centerY in @(208, 286)) { Add-DownArrow $slide7 803 $centerY $mediumBlue | Out-Null }

    $note = $slide7.Shapes.AddTextbox(1, 110, 410, 740, 25)
    $note.TextFrame.TextRange.Text = 'Select the modules required for each procurement specification.'
    $note.TextFrame.TextRange.Font.Name = 'Times New Roman'
    $note.TextFrame.TextRange.Font.Size = 13
    $note.TextFrame.TextRange.Font.Italic = -1
    $note.TextFrame.TextRange.Font.Color.RGB = $darkBlue
    $note.TextFrame.TextRange.ParagraphFormat.Alignment = 2

    # Retain the deck's presenter-led animation language with one click per component column.
    $sequence = $slide7.TimeLine.MainSequence
    foreach ($column in @($leftItems, $centerItems, $rightItems)) {
        $firstInColumn = $true
        foreach ($component in $column) {
            $firstInComponent = $true
            foreach ($shape in $component) {
                $trigger = if ($firstInColumn -and $firstInComponent) { 1 } else { 2 }
                Add-FadeEffect $sequence $shape $trigger
                $firstInComponent = $false
            }
            $firstInColumn = $false
        }
    }

    Set-SpeakerNotes $slide7 @'
Workflow labels are original adaptations of the BIS-SpecAI architecture in this deck.
SVG icon assets: Font Awesome Free, https://fontawesome.com/ and https://github.com/FortAwesome/Font-Awesome (CC BY 4.0).
'@

    $deck.Save()
}
finally {
    if ($null -ne $deck) {
        $deck.Close()
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($deck)
    }
    if ($null -ne $ppt) {
        $ppt.Quit()
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt)
    }
}

Write-Output $outputPath
