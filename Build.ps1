Function New-CodeToken {
    Param(
        [Parameter(Mandatory = $true)]
        [System.Management.Automation.PSTokenType]$Type,
        
        [Parameter(Mandatory = $true, ParameterSetName = 'SourceText')]
        [int]$Start,
        
        [Parameter(Mandatory = $true, ParameterSetName = 'SourceText')]
        [int]$Length,
        
        [Parameter(Mandatory = $true, ParameterSetName = 'SourceText')]
        [string]$SourceText,
        
        [Parameter(Mandatory = $true, ParameterSetName = 'Match')]
        [System.Text.RegularExpressions.Match]$M
    )

    if ($PSBoundParameters.ContainsKey('SourceText')) {
        $Text = $SourceText.Substring($Start, $Length);
        New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            Type = [Enum]::GetName([System.Management.Automation.PSTokenType], $Type);
            Start = $Start;
            Length = $Text.Length;
            Text = $Text;
            NextIndex = $Start + $Text.Length;
        };
    } else {
        New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            Type = [Enum]::GetName([System.Management.Automation.PSTokenType], $Type);
            Start = $M.Index;
            Length = $M.Length;
            Text = $M.Value;
            NextIndex = $M.Index + $M.Length;
        };
    }
}

Function ConvertTo-CodeToken {
    Param(
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        [System.Management.Automation.PSToken]$Token,

        [Parameter(Mandatory = $true)]
        [string]$SourceText
    )

    Process {
        $Text = $SourceText.Substring($Token.Start, $Token.Length);
        New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            Type = [Enum]::GetName([System.Management.Automation.PSTokenType], $Token.Type);
            Start = $Start;
            Length = $Text.Length;
            Text = $Text;
            NextIndex = $Start + $Text.Length;
        }
    }
}

Function ConvertTo-ColorHexRgb {
    [OutputType([string])]
    Param(
        [Parameter(Mandatory = $true)]
        [System.Windows.Media.Color]$Color
    )
    return $Color.R.ToString('x2') + $Color.G.ToString('x2') + $Color.B.ToString('x2');
}

Function ConvertTo-ColorHexRgbDictionary {
    [OutputType([Hashtable])]
    Param(
        [Parameter(Mandatory = $true)]
        [System.Collections.Generic.IDictionary[System.Management.Automation.PSTokenType, System.Windows.Media.Color]]$Dictionary
    )
    $ColorHexRgbDictionary = @{};
    $Dictionary.Keys | ForEach-Object { $ColorHexRgbDictionary.Add([Enum]::GetName([System.Management.Automation.PSTokenType], $_), (ConvertTo-ColorHexRgb -Color $Dictionary[$_])) }
    ,$ColorHexRgbDictionary | Write-Output;
}

Function Get-NextNonWhiteSpacePosition {
    Param(
        [Parameter(Mandatory = $true)]
        [string]$SourceText,
        
        [Parameter(Mandatory = $true)]
        [int]$Position
    )
    while ($Position -lt $SourceText.Length -and [char]::IsWhiteSpace($SourceText[$Position])) { $Position++; }
    $Position | Write-Output;
}

Function Compress-JsCodeTokens {
    Param(
        [Parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)]
        [string]$Type,
        [Parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)]
        [int]$Start,
        [Parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)]
        [int]$Length,
        [Parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)]
        [string]$Text,
        [Parameter(Mandatory = $true, ValueFromPipelineByPropertyName = $true)]
        [int]$NextIndex
    )
    
    Begin {
        $AllTokens = New-Object -TypeName 'System.Collections.ObjectModel.Collection[System.Management.Automation.PSObject]';
    }
    Process {
        $AllTokens.Add((New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            Type = $Type;
            Start = $Start;
            Length = $Length;
            Text = $Text;
            NextIndex = $NextIndex;
        }));
    }
    End {
        for ($i = 0; $i -lt $AllTokens.Count; $i++) {
            if ($AllTokens[$i].Type -eq 'Unknown') {
                if ($i -eq 0 -or $i -eq ($AllTokens.Count - 1)) {
                    Write-Error -Message "Syntax error at position $($AllTokens[$i].Start)" -ErrorAction Stop;
                }
                $PrevToken = $AllTokens[$i - 1];
                $NextToken = $AllTokens[$i + 1];
                if ($PrevToken.NextIndex -ne $AllTokens[$i].Start -or $NextToken.Start -ne $AllTokens[$i].NextIndex) {
                    Write-Error -Message "Syntax error at position $($AllTokens[$i].Start)" -ErrorAction Stop;
                }
                if (($PrevToken.Type -eq 'Variable' -or (($PrevToken.Type -eq 'GroupEnd' -and $PrevToken.Text -ne '}'))) -and ($NextToken.Type -eq 'Variable' -or $NextToken.Type -eq 'Keyword')) {
                    $AllTokens[$i + 1] = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                        Type = 'Member';
                        Start = $NextToken.Start - 1;
                        Length = $NextToken.Length + 1;
                        Text = "." + $NextToken.Text;
                        NextIndex = $NextToken.NextIndex;
                    };
                    $AllTokens.RemoveAt($i);
                    $i--;
                } else {
                    Write-Error -Message "Syntax error at position $($AllTokens[$i].Start)" -ErrorAction Stop;
                }
            }
        }
        for ($i = 0; $i -lt ($AllTokens.Count - 1); $i++) {
            if (($AllTokens[$i].Type -eq 'Variable' -or $AllTokens[$i].Type -eq 'Member') -and ($AllTokens[$i+1].Type -eq 'GroupStart' -and $AllTokens[$i+1].Text -eq '(')) {
                $AllTokens[$i] = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                    Type = 'Command';
                    Start = $AllTokens[$i].Start;
                    Length = $AllTokens[$i].Length;
                    Text = $AllTokens[$i].Text;
                    NextIndex = $AllTokens[$i].NextIndex;
                };
            }
        }
        $AllTokens | Write-Output;
    }
}

Function Convert-PSScriptToHtml {
    Param(
        [string]$SourcePath,
        [string]$TargetPath,
        [bool]$GenerateCliXml = $false
    )

    if ($GenerateCliXml) {
        if ($psISE -eq $null -or $psISE.Options -eq $null -or $Host.Name -ne 'Windows PowerShell ISE Host') {
            Write-Error -Message 'This must be executed within the Windows PowerShell ISE Host to generate a new PsTokenColors.xml file.' -Category ResourceUnavailable -ErrorAction Stop;
        }
        $Script:ColorSettings = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            ConsolePane = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                Foreground = ConvertTo-ColorHexRgb -Color $psISE.Options.ConsolePaneForegroundColor;
                Background = ConvertTo-ColorHexRgb -Color $psISE.Options.ConsolePaneBackgroundColor;
                TokenColors = ConvertTo-ColorHexRgbDictionary -Dictionary $psISE.Options.ConsoleTokenColors;
            };
            ScriptPane = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                Foreground = ConvertTo-ColorHexRgb -Color $psISE.Options.ScriptPaneForegroundColor;
                Background = ConvertTo-ColorHexRgb -Color $psISE.Options.ScriptPaneBackgroundColor;
                TokenColors = ConvertTo-ColorHexRgbDictionary -Dictionary $psISE.Options.TokenColors;
            };
        }
        $ColorSettings | Export-Clixml -LiteralPath ($PSScriptRoot | Join-Path -ChildPath 'TokenColors.xml');
    } else {
        $Script:ColorSettings = Import-Clixml -LiteralPath ($PSScriptRoot | Join-Path -ChildPath 'TokenColors.xml');
    }

    $Path = Read-Host -Prompt 'Enter path to script file';
    $Script:Code = (Get-Content -Path $Path | Out-String).Trim();
    if ($Script:Code -eq $null -or $Script:Code.Length -eq 0) { throw 'Nothing to parse'; }
    $ParseErrors = New-Object -TypeName 'System.Collections.ObjectModel.Collection[System.Management.Automation.PSParseError]';
    $ParsedTokens = @([System.Management.Automation.PSParser]::Tokenize($Script:Code, [ref]$ParseErrors) | ConvertTo-CodeToken -SourceText $Script:Code);
    if ($ParseErrors.Count -gt 0) {
        $lastIdx = $ParseErrors.Count;
        for ($i = 1; $i -lt $lastIdx; $i++) {
            Write-Error -Message $ParseErrors[$i].Message -Category ParserError -TargetObject $ParseErrors[$i].Token -ErrorAction Continue;
        }
        Write-Error -Message $ParseErrors[$lastIdx].Message -Category ParserError -TargetObject $ParseErrors[$lastIdx].Token -ErrorAction Stop;
    }
    $Path = Read-Host -Prompt 'Enter path to output file';
    $Settings = New-Object -TypeName 'System.Xml.XmlWriterSettings';
    $Settings.CheckCharacters = $false;
    $Settings.Indent = $false;
    $Settings.OmitXmlDeclaration = $true;
    $Settings.WriteEndDocumentOnClose = $true;
    $Script:XmlWriter = [System.Xml.XmlWriter]::Create($Path, $Settings);
    $Script:XmlWriter.WriteStartElement('html');
    $Script:XmlWriter.WriteStartElement('head');
    $Script:XmlWriter.WriteStartElement('style');
    $Script:XmlWriter.WriteAttributeString('type', 'text/css');
    $Script:XmlWriter.WriteString(@"

.console-pane,
.script-pane {
    border: 2px double var(--secondary);
    padding: 4pt;
    display: block;
    overflow: scroll;
    white-space: nowrap;
}
.console-pane,
.script-pane,
.console-pane code,
.script-pane code,
.console-pane var,
.script-pane var {
    font: var(--font-family-monospace);
    font-size: small;
    font-weight: normal;
}
"@);

    $ScriptTokenTypeMap = @{};
    $ConsoleTokenTypeMap = @{};
    ((@(
        (New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            ClassName = 'script-pane';
            ParentSelector = '';
            TagName = '';
            Color = $Script:ColorSettings.ScriptPane.Foreground;
        }), (New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            ClassName = 'code';
            ParentSelector = '.script-pane';
            TagName = '';
            Color = $Script:ColorSettings.ScriptPane.Foreground;
        }), (New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            ClassName = 'console-pane';
            ParentSelector = '';
            TagName = '';
            Color = $Script:ColorSettings.ConsolePane.Foreground;
        }), (New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            ClassName = 'code';
            ParentSelector = '.console-pane';
            TagName = '';
            Color = $Script:ColorSettings.ConsolePane.Foreground;
        })
    ) + @($Script:ColorSettings.ScriptPane.TokenColors.Keys | ForEach-Object {
        $Color = $Script:ColorSettings.ScriptPane.TokenColors[$_];
        switch ($_) {
            'String' {
                $RenderInfo = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                    ClassName = '';
                    ParentSelector = '.script-pane';
                    TagName = 'q';
                    Color = $Color
                };
                $ScriptTokenTypeMap[$_] = $RenderInfo;
                $RenderInfo | Write-Output;
                break;
            }
            'Variable' {
                $RenderInfo = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                    ClassName = '';
                    ParentSelector = '.script-pane';
                    TagName = 'var';
                    Color = $Color;
                };
                $ScriptTokenTypeMap[$_] = $RenderInfo;
                $RenderInfo | Write-Output;
                break;
            }
            default {
                if ($Color -ne $Script:ColorSettings.ScriptPane.Foreground) {
                    $RenderInfo = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                        ClassName = 'script-' + $_.ToLower();
                        ParentSelector = '.script-pane';
                        TagName = '';
                        Color = $Color;
                    };
                    $ScriptTokenTypeMap[$_] = $RenderInfo;
                    $RenderInfo | Write-Output;
                }
                break;
            }
        }
    }) + @($Script:ColorSettings.ConsolePane.TokenColors.Keys | ForEach-Object {
        $Color = $Script:ColorSettings.ConsolePane.TokenColors[$_];
        switch ($_) {
            'String' {
                $RenderInfo = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                    ClassName = '';
                    ParentSelector = '.console-pane';
                    TagName = 'q';
                    Color = $Color
                };
                $ConsoleTokenTypeMap[$_] = $RenderInfo;
                $RenderInfo | Write-Output;
                break;
            }
            'Variable' {
                $RenderInfo = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                    ClassName = '';
                    ParentSelector = '.console-pane';
                    TagName = 'var';
                    Color = $Color
                };
                $ConsoleTokenTypeMap[$_] = $RenderInfo;
                $RenderInfo | Write-Output;
                break;
            }
            default {
                if ($Color -ne $Script:ColorSettings.ConsolePane.Foreground) {
                    $RenderInfo = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                        ClassName = 'console-' + $_.ToLower();
                        ParentSelector = '.console-pane';
                        TagName = '';
                        Color = $Color;
                    };
                    $ConsoleTokenTypeMap[$_] = $RenderInfo;
                    $RenderInfo | Write-Output;
                }
                break;
            }
        }
    })) | Group-Object -Property 'Color') | ForEach-Object {
        $Selectors = @($_.Group | ForEach-Object {
            if ($_.ParentSelector.Length -gt 0) {
                if ($_.TagName.Length -gt 0) { "$($_.ParentSelector) $($_.TagName)" } else { "$($_.ParentSelector) .$($_.ClassName)" }
            } else {
                if ($_.TagName.Length -gt 0) { $_.TagName } else { ".$($_.ClassName)" }
            }
        });
        $Rules = @("color: #$($_.Name)");
        if (@($_.Group | Where-Object { $_.ParentSelector.Length -eq 0 -and $_.ClassName -eq 'script-pane' }).Count -gt 0) { $Rules = $Rules + @("background-color: #$($Script:ColorSettings.ScriptPane.Background)"); }
        if (@($_.Group | Where-Object { $_.ParentSelector.Length -eq 0 -and $_.ClassName -eq 'console-pane' }).Count -gt 0) { $Rules = $Rules + @("background-color: #$($Script:ColorSettings.ConsolePane.Background)") }
        if ($Rules.Count -eq 1) {
            $Script:XmlWriter.WriteString("`r`n$($Selectors -join ", ") { $($Rules[0]); }");
        } else {
            $Script:XmlWriter.WriteString(@"

$($Selectors -join ",`r`n") {
    $($Rules -join ";`r`n    ");
}
"@);
        }
    }
    $Script:XmlWriter.WriteString(@"

.script-pane q:before, .console-pane q:before { content: no-open-quote; }
.script-pane q:after, .console-pane q:after { content: no-close-quote; }

"@);

    $Script:XmlWriter.WriteEndElement();
    $Script:XmlWriter.WriteEndElement();
    $Script:XmlWriter.WriteStartElement('body');
    $Script:XmlWriter.WriteString("`r`n");
    $Script:XmlWriter.WriteStartElement('pre');
    $Script:XmlWriter.WriteAttributeString('class', 'script-pane');
    $Script:XmlWriter.WriteStartElement('code');
    try {
        $StartIndex = 0;
        $ParsedTokens | ForEach-Object {
            $Token = $_;
            if ($ScriptTokenTypeMap.ContainsKey($Token.Type)) {
                if ($Token.Start -gt $StartIndex) { $Script:XmlWriter.WriteString($Script:Code.Substring($StartIndex, $Token.Start - $StartIndex)) }
                if ($ScriptTokenTypeMap[$Token.Type].TagName.Length -gt 0) {
                    $XmlWriter.WriteStartElement($ScriptTokenTypeMap[$Token.Type].TagName);
                    $Script:XmlWriter.WriteString($Token.Text);
                    $XmlWriter.WriteEndElement();
                } else {
                    $XmlWriter.WriteStartElement('span');
                    $XmlWriter.WriteAttributeString('class', $ScriptTokenTypeMap[$Token.Type].ClassName);
                    $Script:XmlWriter.WriteString($Token.Text);
                    $XmlWriter.WriteEndElement();
                }
                $StartIndex = $NextIndex;
            }
        }
        if ($StartIndex -lt $Script:Code.Length) { $Script:XmlWriter.WriteString($Script:Code.Substring($StartIndex)) }
        $Script:XmlWriter.WriteEndElement();
        $Script:XmlWriter.WriteEndElement();
        $Script:XmlWriter.WriteString("`r`n");
        $Script:XmlWriter.WriteStartElement('pre');
        $Script:XmlWriter.WriteAttributeString('class', 'console-pane');
        $Script:XmlWriter.WriteStartElement('code');
        $StartIndex = 0;
        $ParsedTokens | ForEach-Object {
            [System.Management.Automation.PSToken]$Token = $_;
            $Token.Type = [Enum]::GetName([System.Management.Automation.PSTokenType], $Token.Type);
            if ($ConsoleTokenTypeMap.ContainsKey($Token.Type)) {
                if ($Token.Start -gt $StartIndex) { $Script:XmlWriter.WriteString($Script:Code.Substring($StartIndex, $Token.Start - $StartIndex)) }
                if ($ConsoleTokenTypeMap[$Token.Type].TagName.Length -gt 0) {
                    $XmlWriter.WriteStartElement($ConsoleTokenTypeMap[$Token.Type].TagName);
                    $Script:XmlWriter.WriteString($Script:Code.Substring($Token.Start, $Token.Length));
                    $XmlWriter.WriteEndElement();
                } else {
                    $XmlWriter.WriteStartElement('span');
                    $XmlWriter.WriteAttributeString('class', $ConsoleTokenTypeMap[$Token.Type].ClassName);
                    $Script:XmlWriter.WriteString($Script:Code.Substring($Token.Start, $Token.Length));
                    $XmlWriter.WriteEndElement();
                }
                $StartIndex = $Token.Start + $Token.Length;
            }
        }
        if ($StartIndex -lt $Script:Code.Length) { $Script:XmlWriter.WriteString($Script:Code.Substring($StartIndex)) }
    } finally {
        $Script:XmlWriter.WriteEndElement();
        $Script:XmlWriter.WriteEndElement();
        $Script:XmlWriter.WriteString("`r`n");
        $Script:XmlWriter.WriteEndElement();
        $Script:XmlWriter.WriteEndElement();
        $Script:XmlWriter.Flush();
        $XmlWriter.Close();
    }
}

Function Search-JsToken {
    Param(
        [Parameter(Mandatory = $true)]
        [string]$SourceText,
        
        [Parameter(Mandatory = $true)]
        [int]$Position
    )

    $m = $Script:SeparatorRegex.Match($SourceText, $Position);
    if ($m.Success) {
        if ($m.Groups[2].Success) {
            New-CodeToken -Type StatementSeparator -M $m.Groups[1];
        } else {
            New-CodeToken -Type NewLine -M $m.Groups[1];
            if ($m.Groups[3].Success) {
                New-CodeToken -Type Unknown -M $m.Groups[1];
            } else {
                New-CodeToken -Type NewLine -M $m.Groups[1];
            }
        }
    } else {
        $m = $Script:NumberRegex.Match($SourceText, $Position);
        if ($m.Success) {
            New-CodeToken -Type Number -M $m.Groups[1];
        } else {
            $m = $Script:OperatorRegex.Match($SourceText, $Position);
            if ($m.Success) {
                New-CodeToken -Type Operator -M $m.Groups[1];
            } else {
                $m = $Script:StringRegex.Match($SourceText, $Position);
                if ($m.Success) {
                    New-CodeToken -Type String -M $m.Groups[1];
                } else {
                    $m = $Script:CommentRegex.Match($SourceText, $Position);
                    if ($m.Success) {
                        New-CodeToken -Type Comment -M $m.Groups[1];
                    } else {
                        $m = $Script:GroupingRegex.Match($SourceText, $Position);
                        if ($m.Success) {
                            if ($m.Groups[2].Success) {
                                New-CodeToken -Type GroupStart -M $m.Groups[1];
                            } else {
                                New-CodeToken -Type GroupEnd -M $m.Groups[1];
                            }
                        } else {
                            $m = $Script:NameRegex.Match($SourceText, $Position);
                            if ($m.Success) {
                                if ($Script:JsKeywords -ccontains $m.Groups[1].Value) {
                                    New-CodeToken -Type Keyword -M $m.Groups[1];
                                } else {
                                    New-CodeToken -Type Variable -M $m.Groups[1];
                                }
                            } else {
                                $Text = $SourceText.Substring($Position);
                                if ($Text.TrimEnd().Length -gt 0) {
                                    Write-Error -Message "Syntax unknown at position $Position" -Category SyntaxError -TargetObject $Text;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

Function Get-JsCodeTokens {
    Param(
        [Parameter(Mandatory = $true)]
        [string]$SourceText
    )
    
    $Token = Search-JsToken -SourceText $SourceText -Position 0;
    while ($Token -ne $null) {
        $Token | Write-Output;
        $NextToken = Search-JsToken -SourceText $SourceText -Position 0;
        $Token = Search-JsToken -SourceText $SourceText -Position $Token.NextIndex;
    }
}

Function Convert-JavaScriptToHtml {
    Param(
        [string]$SourcePath,
        [string]$TargetPath
    )

    $Script:ColorSettings = Import-Clixml -LiteralPath ($PSScriptRoot | Join-Path -ChildPath 'TokenColors.xml');

    $Path = Read-Host -Prompt 'Enter path to JavaScript file';
    $Script:Code = (Get-Content -Path $Path | Out-String).Trim();
    if ($Script:Code -eq $null -or $Script:Code.Length -eq 0) { throw 'Nothing to parse'; }

    $Script:SeparatorRegex = New-Object -TypeName 'System.Text.RegularExpressions.Regex' -ArgumentList '\G[^\r\n\S]*(\r\n?|\n|(;)|(\.))', ([System.Text.RegularExpressions.RegexOptions]::Compiled);
    $Script:NumberRegex = New-Object -TypeName 'System.Text.RegularExpressions.Regex' -ArgumentList '\G[^\r\n\S]*(-?\d+(\.\d+)(e\d+)?|0x[a-fA-F\d]+)', ([System.Text.RegularExpressions.RegexOptions]::Compiled);
    $Script:OperatorRegex = New-Object -TypeName 'System.Text.RegularExpressions.Regex' -ArgumentList '\G[^\r\n\S]*(([=!]=?|[+\-*/%<>])=?|\+\+|--|\?|,|&&?|\|\|?|~|\^|<<|>>>?|=>)', ([System.Text.RegularExpressions.RegexOptions]::Compiled);
    $Script:StringRegex = New-Object -TypeName 'System.Text.RegularExpressions.Regex' -ArgumentList ("\G[^\r\n\S]*('[^'\r\n\\]*(\\([^\r\n]|\r\n?|\n)[^'\r\n\\]*)*(?<t>')?|" + '\G\s*"[^"\r\n\\]*(\\([^\r\n]|\r\n?|\n)[^"\r\n\\]*)*(?<t>")?)'), ([System.Text.RegularExpressions.RegexOptions]::Compiled);
    $Script:GroupingRegex = New-Object -TypeName 'System.Text.RegularExpressions.Regex' -ArgumentList '\G[^\r\n\S]*(([\[({])|([\])}]))', ([System.Text.RegularExpressions.RegexOptions]::Compiled);
    $Script:CommentRegex = New-Object -TypeName 'System.Text.RegularExpressions.Regex' -ArgumentList '\G[^\r\n\S]*(//[^\r\n]*(?=[\r\n])|/\*[^*]*(\*[^/][^*]*)*\*/)', ([System.Text.RegularExpressions.RegexOptions]::Compiled);
    $Script:NameRegex = New-Object -TypeName 'System.Text.RegularExpressions.Regex' -ArgumentList '\G[^\r\n\S]*([$_a-zA-Z][$_a-zA-Z\d]+)', ([System.Text.RegularExpressions.RegexOptions]::Compiled);
    $Script:JsKeywords = @('abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double',
        'else', 'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int', 'interface',
        'let', 'long', 'native', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
        'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield');

    $ParsedTokens = @((Get-JsCodeTokens -SourceText $Script:Code) | Compress-JsCodeTokens);

    $Path = Read-Host -Prompt 'Enter path to output file';
    $Settings = New-Object -TypeName 'System.Xml.XmlWriterSettings';
    $Settings.CheckCharacters = $false;
    $Settings.Indent = $false;
    $Settings.OmitXmlDeclaration = $true;
    $Settings.WriteEndDocumentOnClose = $true;
    $Script:XmlWriter = [System.Xml.XmlWriter]::Create($Path, $Settings);
    $Script:XmlWriter.WriteStartElement('html');
    $Script:XmlWriter.WriteStartElement('head');
    $Script:XmlWriter.WriteStartElement('style');
    $Script:XmlWriter.WriteAttributeString('type', 'text/css');
    $Script:XmlWriter.WriteString(@"

.console-pane,
.script-pane {
    border: 2px double var(--secondary);
    padding: 4pt;
    display: block;
}
.console-pane,
.script-pane,
.console-pane code,
.script-pane code,
.console-pane var,
.script-pane var {
    font: var(--font-family-monospace);
    font-size: small;
    font-weight: normal;
}
"@);

    $ScriptTokenTypeMap = @{};
    $ConsoleTokenTypeMap = @{};
    ((@(
        (New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            ClassName = 'script-pane';
            ParentSelector = '';
            TagName = '';
            Color = $Script:ColorSettings.ScriptPane.Foreground;
        }), (New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            ClassName = 'code';
            ParentSelector = '.script-pane';
            TagName = '';
            Color = $Script:ColorSettings.ScriptPane.Foreground;
        }), (New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            ClassName = 'console-pane';
            ParentSelector = '';
            TagName = '';
            Color = $Script:ColorSettings.ConsolePane.Foreground;
        }), (New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
            ClassName = 'code';
            ParentSelector = '.console-pane';
            TagName = '';
            Color = $Script:ColorSettings.ConsolePane.Foreground;
        })
    ) + @($Script:ColorSettings.ScriptPane.TokenColors.Keys | ForEach-Object {
        $Color = $Script:ColorSettings.ScriptPane.TokenColors[$_];
        switch ($_) {
            'String' {
                $RenderInfo = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                    ClassName = '';
                    ParentSelector = '.script-pane';
                    TagName = 'q';
                    Color = $Color
                };
                $ScriptTokenTypeMap[$_] = $RenderInfo;
                $RenderInfo | Write-Output;
                break;
            }
            'Variable' {
                $RenderInfo = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                    ClassName = '';
                    ParentSelector = '.script-pane';
                    TagName = 'var';
                    Color = $Color;
                };
                $ScriptTokenTypeMap[$_] = $RenderInfo;
                $RenderInfo | Write-Output;
                break;
            }
            default {
                if ($Color -ne $Script:ColorSettings.ScriptPane.Foreground) {
                    $RenderInfo = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                        ClassName = 'script-' + $_.ToLower();
                        ParentSelector = '.script-pane';
                        TagName = '';
                        Color = $Color;
                    };
                    $ScriptTokenTypeMap[$_] = $RenderInfo;
                    $RenderInfo | Write-Output;
                }
                break;
            }
        }
    }) + @($Script:ColorSettings.ConsolePane.TokenColors.Keys | ForEach-Object {
        $Color = $Script:ColorSettings.ConsolePane.TokenColors[$_];
        switch ($_) {
            'String' {
                $RenderInfo = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                    ClassName = '';
                    ParentSelector = '.console-pane';
                    TagName = 'q';
                    Color = $Color
                };
                $ConsoleTokenTypeMap[$_] = $RenderInfo;
                $RenderInfo | Write-Output;
                break;
            }
            'Variable' {
                $RenderInfo = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                    ClassName = '';
                    ParentSelector = '.console-pane';
                    TagName = 'var';
                    Color = $Color
                };
                $ConsoleTokenTypeMap[$_] = $RenderInfo;
                $RenderInfo | Write-Output;
                break;
            }
            default {
                if ($Color -ne $Script:ColorSettings.ConsolePane.Foreground) {
                    $RenderInfo = New-Object -TypeName 'System.Management.Automation.PSObject' -Property @{
                        ClassName = 'console-' + $_.ToLower();
                        ParentSelector = '.console-pane';
                        TagName = '';
                        Color = $Color;
                    };
                    $ConsoleTokenTypeMap[$_] = $RenderInfo;
                    $RenderInfo | Write-Output;
                }
                break;
            }
        }
    })) | Group-Object -Property 'Color') | ForEach-Object {
        $Selectors = @($_.Group | ForEach-Object {
            if ($_.ParentSelector.Length -gt 0) {
                if ($_.TagName.Length -gt 0) { "$($_.ParentSelector) $($_.TagName)" } else { "$($_.ParentSelector) .$($_.ClassName)" }
            } else {
                if ($_.TagName.Length -gt 0) { $_.TagName } else { ".$($_.ClassName)" }
            }
        });
        $Rules = @("color: #$($_.Name)");
        if (@($_.Group | Where-Object { $_.ParentSelector.Length -eq 0 -and $_.ClassName -eq 'script-pane' }).Count -gt 0) { $Rules = $Rules + @("background-color: #$($Script:ColorSettings.ScriptPane.Background)"); }
        if (@($_.Group | Where-Object { $_.ParentSelector.Length -eq 0 -and $_.ClassName -eq 'console-pane' }).Count -gt 0) { $Rules = $Rules + @("background-color: #$($Script:ColorSettings.ConsolePane.Background)") }
        if ($Rules.Count -eq 1) {
            $Script:XmlWriter.WriteString("`r`n$($Selectors -join ", ") { $($Rules[0]); }");
        } else {
            $Script:XmlWriter.WriteString(@"

$($Selectors -join ",`r`n") {
    $($Rules -join ";`r`n    ");
}
"@);
        }
    }
    $Script:XmlWriter.WriteString(@"

.script-pane q:before, .console-pane q:before { content: no-open-quote; }
.script-pane q:after, .console-pane q:after { content: no-close-quote; }

"@);

    $Script:XmlWriter.WriteEndElement();
    $Script:XmlWriter.WriteEndElement();
    $Script:XmlWriter.WriteStartElement('body');
    $Script:XmlWriter.WriteString("`r`n");
    $Script:XmlWriter.WriteStartElement('pre');
    $Script:XmlWriter.WriteAttributeString('class', 'script-pane');
    $Script:XmlWriter.WriteStartElement('code');
    try {
        $StartIndex = 0;
        $ParsedTokens | ForEach-Object {
            $Token = $_;
            $TokenTypeName = [Enum]::GetName([System.Management.Automation.PSTokenType], $Token.Type);
            if ($ScriptTokenTypeMap.ContainsKey($TokenTypeName)) {
                if ($Token.Start -gt $StartIndex) { $Script:XmlWriter.WriteString($Script:Code.Substring($StartIndex, $Token.Start - $StartIndex)) }
                if ($ScriptTokenTypeMap[$TokenTypeName].TagName.Length -gt 0) {
                    $XmlWriter.WriteStartElement($ScriptTokenTypeMap[$TokenTypeName].TagName);
                    $Script:XmlWriter.WriteString($Script:Code.Substring($Token.Start, $Token.Length));
                    $XmlWriter.WriteEndElement();
                } else {
                    $XmlWriter.WriteStartElement('span');
                    $XmlWriter.WriteAttributeString('class', $ScriptTokenTypeMap[$TokenTypeName].ClassName);
                    $Script:XmlWriter.WriteString($Script:Code.Substring($Token.Start, $Token.Length));
                    $XmlWriter.WriteEndElement();
                }
                $StartIndex = $Token.Start + $Token.Length;
            }
        }
        if ($StartIndex -lt $Script:Code.Length) { $Script:XmlWriter.WriteString($Script:Code.Substring($StartIndex)) }
        $Script:XmlWriter.WriteEndElement();
        $Script:XmlWriter.WriteEndElement();
        $Script:XmlWriter.WriteString("`r`n");
        $Script:XmlWriter.WriteStartElement('pre');
        $Script:XmlWriter.WriteAttributeString('class', 'console-pane');
        $Script:XmlWriter.WriteStartElement('code');
        $StartIndex = 0;
        $ParsedTokens | ForEach-Object {
            $Token = $_;
            $TokenTypeName = [Enum]::GetName([System.Management.Automation.PSTokenType], $Token.Type);
            if ($ConsoleTokenTypeMap.ContainsKey($TokenTypeName)) {
                if ($Token.Start -gt $StartIndex) { $Script:XmlWriter.WriteString($Script:Code.Substring($StartIndex, $Token.Start - $StartIndex)) }
                if ($ConsoleTokenTypeMap[$TokenTypeName].TagName.Length -gt 0) {
                    $XmlWriter.WriteStartElement($ConsoleTokenTypeMap[$TokenTypeName].TagName);
                    $Script:XmlWriter.WriteString($Script:Code.Substring($Token.Start, $Token.Length));
                    $XmlWriter.WriteEndElement();
                } else {
                    $XmlWriter.WriteStartElement('span');
                    $XmlWriter.WriteAttributeString('class', $ConsoleTokenTypeMap[$TokenTypeName].ClassName);
                    $Script:XmlWriter.WriteString($Script:Code.Substring($Token.Start, $Token.Length));
                    $XmlWriter.WriteEndElement();
                }
                $StartIndex = $Token.Start + $Token.Length;
            }
        }
        if ($StartIndex -lt $Script:Code.Length) { $Script:XmlWriter.WriteString($Script:Code.Substring($StartIndex)) }
    } finally {
        $Script:XmlWriter.WriteEndElement();
        $Script:XmlWriter.WriteEndElement();
        $Script:XmlWriter.WriteString("`r`n");
        $Script:XmlWriter.WriteEndElement();
        $Script:XmlWriter.WriteEndElement();
        $Script:XmlWriter.Flush();
        $XmlWriter.Close();
    }
}