$CodeText = @'
namespace EncodingHelper {
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.Globalization;
    using System.IO;
    using System.Text;
    public enum DataEncodingConfidence {
        High,
        Medium,
        Low
    }
    public class EncodedData {
        public static readonly SupportedEncodingsDictionary _supportedEncodings = new SupportedEncodingsDictionary();
        private byte[] _data = new byte[0];
        private IDataBufferEncoder _encoder;
       
        private DataEncodingConfidence _confidence = DataEncodingConfidence.Low;
        public static SupportedEncodingsDictionary SupportedEncodings { get { return _supportedEncodings; } }
        public EncodedData() { _encoder = null; }
        public EncodedData(IDataBufferEncoder encoder) { _encoder = encoder; }
        public EncodedData(Encoding encoding) { _encoder = SupportedEncodingsDictionary.AsEncoder(encoding); }
        public int Length { get { return _data.Length; } }
        public DataEncodingConfidence Confidence { get { return _confidence; } }
        public string ToBase64String(bool noLineBreaks, int offset, int length) {
            if (offset < 0)
                throw new ArgumentOutOfRangeException("offset", "Offset cannot be less than zero");
            if (offset > _data.Length)
                throw new ArgumentOutOfRangeException("offset", "Offset cannot be greater than Length");
            if ((offset + length) > _data.Length)
                length = _data.Length - offset;
            return Convert.ToBase64String(_data, offset, length, (noLineBreaks) ? Base64FormattingOptions.None : Base64FormattingOptions.InsertLineBreaks);
        }
        public string ToBase64String(bool noLineBreaks, int offset) { return ToBase64String(noLineBreaks, offset, _data.Length - offset); }
        public string ToBase64String(bool noLineBreaks) { return Convert.ToBase64String(_data, (noLineBreaks) ? Base64FormattingOptions.None : Base64FormattingOptions.InsertLineBreaks); }
        public string ToBase64String() { return Convert.ToBase64String(_data); }
        public string ToHexString() {
            StringBuilder stringBuilder = new StringBuilder();
            for (int i = 0; i < _data.Length; i++)
                stringBuilder.Append(_data[i].ToString("x2"));
            return stringBuilder.ToString();
        }
        public void LoadBase64String(string s, Encoding encoding) { LoadBase64String(s, SupportedEncodingsDictionary.AsEncoder(encoding)); }
        public void LoadBase64String(string s, IDataBufferEncoder encoder) {
            if (s == null)
                throw new ArgumentNullException("s");
            _data = Convert.FromBase64String(s);
            if (encoder != null) {
                _encoder = encoder;
                try {
                    encoder.GetString(_data);
                    _confidence = DataEncodingConfidence.High;
                } catch {
                    _confidence = DataEncodingConfidence.Medium;
                }
                return;
            }
            using (MemoryStream stream = new MemoryStream(_data))
                Load(stream);
        }
        public void LoadBase64String(string s) { LoadBase64String(s, null as IDataBufferEncoder); }
        public void Load(Stream stream, Encoding encoding) {
            if (stream == null)
                throw new ArgumentNullException("stream");
            if (encoding == null)
                Load(stream);
            else {
                using (StreamReader reader = new StreamReader(stream, encoding))
                    LoadEncodedString(reader.ReadToEnd(), SupportedEncodingsDictionary.AsEncoder(encoding), true);
            }
        }
        public void Load(Stream stream) {
            if (stream == null)
                throw new ArgumentNullException("stream");
            using (StreamReader reader = new StreamReader(stream, true))
                LoadEncodedString(reader.ReadToEnd(), SupportedEncodingsDictionary.AsEncoder(reader.CurrentEncoding));
        }
        public void LoadEncodedString(string s, Encoding encoding) { LoadEncodedString(s, SupportedEncodingsDictionary.AsEncoder(encoding)); }
        public void LoadEncodedString(string s, IDataBufferEncoder encoder) {
            if (encoder == null)
                LoadEncodedString(s, (_encoder == null) ? SupportedEncodingsDictionary.DefaultEncoder : _encoder, false);
            else
                LoadEncodedString(s, encoder, true);
        }
        private void LoadEncodedString(string s, IDataBufferEncoder encoder, bool isExplicitEncoding) {
            if (s == null)
                throw new ArgumentNullException("s");
            byte[] data;
            try {
                data = encoder.GetBytes(s);
                _confidence = DataEncodingConfidence.High;
                _encoder = encoder;
                _data = data;
            } catch {
                if (isExplicitEncoding)
                    throw;
                string name = encoder.Name;
                encoder = null;
                foreach (string n in _supportedEncodings.Keys) {
                    if (n == name)
                        continue;
                    encoder = _supportedEncodings[n];
                    try {
                        data = encoder.GetBytes(s);
                        _confidence = DataEncodingConfidence.High;
                        _encoder = encoder;
                        _data = data;
                    } catch {
                        encoder = null;
                    }
                    if (encoder != null)
                        break;
                }
                if (encoder == null) {
                    if (name != SupportedEncodingsDictionary.EncodingKey_utf7) {
                        encoder = SupportedEncodingsDictionary.AsEncoder(new UTF7Encoding(true));
                        try {
                            data = encoder.GetBytes(s);
                            _confidence = DataEncodingConfidence.Medium;
                            _encoder = encoder;
                            _data = data;
                        } catch {
                            encoder = null;
                        }
                    }
                    if (encoder == null) {
                        _confidence = DataEncodingConfidence.Low;
                        encoder = SupportedEncodingsDictionary.AsEncoder((name == SupportedEncodingsDictionary.EncodingKey_utf8) ? (Encoding)(new UnicodeEncoding(false, false, false)) : new UTF8Encoding(false, false));
                        try {
                            data = encoder.GetBytes(s);
                            _encoder = encoder;
                            _data = data;
                        } catch {
                            throw;
                        }
                    }
                }
            }
        }
    }
    
    public interface IDataBufferEncoder {
        string Name { get; }
        byte[] GetBytes(string s);
        string GetString(byte[] bytes);
    }
    public class EncodingDataBufferEncoder<T> : IDataBufferEncoder
            where T : Encoding {
        private T _encoding;
        public string Name { get { return _encoding.EncodingName; } }
        public Encoding Encoding { get { return _encoding; } }
        public EncodingDataBufferEncoder(T encoding) {
            if (encoding == null)
                throw new ArgumentNullException("encoding");
            _encoding = encoding;
        }
        public byte[] GetBytes(string s) { return _encoding.GetBytes(s); }
        public string GetString(byte[] bytes) { return _encoding.GetString(bytes); }
    }
    public class Base64DataBufferEncoder : IDataBufferEncoder {
        private bool _noLineBreaks;
        public string Name { get { return SupportedEncodingsDictionary.EncodingKey_base64; } }
        public Base64DataBufferEncoder(bool noLineBreaks) { _noLineBreaks = noLineBreaks; }
        public byte[] GetBytes(string s) { return Convert.FromBase64String(s); }
        public string GetString(byte[] bytes) { return Convert.ToBase64String(bytes, (_noLineBreaks) ? Base64FormattingOptions.None : Base64FormattingOptions.InsertLineBreaks); }
    }
    public class HexDataBufferEncoder : IDataBufferEncoder {
        public string Name { get { return SupportedEncodingsDictionary.EncodingKey_hex; } }
        public byte[] GetBytes(string s) {
            if (s == null)
                throw new ArgumentNullException("s");
            if (s.Length == 0)
                return new byte[0];
            List<byte> list = new List<byte>();
            int l = s.Length;
            for (int i = 0; i < l; i+=2) {
                if (Char.IsControl(s[i]) || Char.IsWhiteSpace(s[i])) {
                    i--;
                    continue;
                }
                try { list.Add(Byte.Parse(s.Substring(i, 2), NumberStyles.HexNumber)); }
                catch (Exception exc) {
                    throw new ArgumentException("Invalid hexidecimal pair at index " + i.ToString(), "s", exc);
                }

            }
            return list.ToArray();
        }
        public string GetString(byte[] bytes) {
            StringBuilder stringBuilder = new StringBuilder();
            for (int i = 0; i < bytes.Length; i++)
                stringBuilder.Append(bytes[i].ToString("x2"));
            return stringBuilder.ToString();
        }
    }
    public class SupportedEncodingsDictionary : IDictionary<string, IDataBufferEncoder>, IDictionary {
        public static IDataBufferEncoder AsEncoder(Encoding enc) {
            if (enc == null)
                return null;
            return (IDataBufferEncoder)(Activator.CreateInstance(typeof(EncodingDataBufferEncoder<>).MakeGenericType(enc.GetType()), new object[] { enc }));
        }
        public const string EncodingKey_utf8 = "utf8";
        public const string EncodingKey_utf7 = "utf7";
        public const string EncodingKey_ascii = "ascii";
        public const string EncodingKey_utf16le = "utf16le";
        public const string EncodingKey_utf16be = "utf16be";
        public const string EncodingKey_utf32le = "utf32le";
        public const string EncodingKey_utf32be = "utf32be";
        public const string EncodingKey_latin1 = "latin1";
        public const string EncodingKey_windows = "windows";
        public const string EncodingKey_ebcdic500 = "ebcdic500";
        public const string EncodingKey_ebcdic1140 = "ebcdic1140";
        public const string EncodingKey_ebcdic37 = "ebcdic37";
        public const string EncodingKey_base64 = "base64";
        public const string EncodingKey_hex = "hex";
        public static readonly EncodingDataBufferEncoder<ASCIIEncoding> ASCII = new EncodingDataBufferEncoder<ASCIIEncoding>(new ASCIIEncoding());
        public static readonly EncodingDataBufferEncoder<UnicodeEncoding> UTF16LE = new EncodingDataBufferEncoder<UnicodeEncoding>(new UnicodeEncoding(false, false, true));
        public static readonly EncodingDataBufferEncoder<UnicodeEncoding> UTF16BE = new EncodingDataBufferEncoder<UnicodeEncoding>(new UnicodeEncoding(true, false, true));
        public static readonly EncodingDataBufferEncoder<UTF32Encoding> UTF32LE = new EncodingDataBufferEncoder<UTF32Encoding>(new UTF32Encoding(false, false, true));
        public static readonly EncodingDataBufferEncoder<UTF32Encoding> UTF32BE = new EncodingDataBufferEncoder<UTF32Encoding>(new UTF32Encoding(true, false, true));
        public static readonly EncodingDataBufferEncoder<UTF8Encoding> UTF8 = new EncodingDataBufferEncoder<UTF8Encoding>(new UTF8Encoding(false, true));
        public static readonly EncodingDataBufferEncoder<UTF7Encoding> UTF7 = new EncodingDataBufferEncoder<UTF7Encoding>(new UTF7Encoding(false));
        public static readonly EncodingDataBufferEncoder<Encoding> Latin1 = new EncodingDataBufferEncoder<Encoding>(Encoding.GetEncoding("iso-8859-1"));
        public static readonly EncodingDataBufferEncoder<Encoding> Windows = new EncodingDataBufferEncoder<Encoding>(Encoding.GetEncoding("Windows-1252"));
        public static readonly EncodingDataBufferEncoder<Encoding> EBCDIC500 = new EncodingDataBufferEncoder<Encoding>(Encoding.GetEncoding("IBM500"));
        public static readonly EncodingDataBufferEncoder<Encoding> EBCDIC1140 = new EncodingDataBufferEncoder<Encoding>(Encoding.GetEncoding("IBM01140"));
        public static readonly EncodingDataBufferEncoder<Encoding> EBCDIC37 = new EncodingDataBufferEncoder<Encoding>(Encoding.GetEncoding("IBM037"));
        public static readonly Base64DataBufferEncoder Base64 = new Base64DataBufferEncoder(false);
        public static readonly HexDataBufferEncoder Hex = new HexDataBufferEncoder();
        private static readonly string[] _innerKeys = new string[] { EncodingKey_utf8, EncodingKey_utf7, EncodingKey_ascii, EncodingKey_utf16le, EncodingKey_utf16be, EncodingKey_utf32le, EncodingKey_utf32be, EncodingKey_latin1,
            EncodingKey_windows, EncodingKey_ebcdic500, EncodingKey_ebcdic1140, EncodingKey_ebcdic37, EncodingKey_base64, EncodingKey_hex };
        private static readonly IDataBufferEncoder[] _innerValues = new IDataBufferEncoder[] { UTF8, UTF7, ASCII, UTF16LE, UTF16BE, UTF32LE, UTF32BE, Latin1, Windows, EBCDIC500, EBCDIC1140, EBCDIC37, Base64, Hex };
        public static IDataBufferEncoder DefaultEncoder { get { return _innerValues[0]; } }
        private ReadOnlyCollection<string> _keys;
        private ReadOnlyCollection<IDataBufferEncoder> _values;
        private Dictionary<string, IDataBufferEncoder> _innerDictionary = new Dictionary<string, IDataBufferEncoder>(StringComparer.InvariantCultureIgnoreCase);
        public SupportedEncodingsDictionary()
        {
            _keys = new ReadOnlyCollection<string>(_innerKeys);
            _values = new ReadOnlyCollection<IDataBufferEncoder>(_innerValues);
            for (int i = 0; i < _innerKeys.Length; i++)
                _innerDictionary.Add(_innerKeys[i], _innerValues[i]);
            foreach (IDataBufferEncoder encoder in _innerValues) {
                if (!_innerDictionary.ContainsKey(encoder.Name))
                    _innerDictionary.Add(encoder.Name, encoder);
            }
        }
        public int Count { get { return _innerKeys.Length; } }
        bool ICollection<KeyValuePair<string, IDataBufferEncoder>>.IsReadOnly { get { return true; } }
        bool IDictionary.IsFixedSize { get { return true; } }
        bool IDictionary.IsReadOnly { get { return true; } }
        bool ICollection.IsSynchronized { get { return ((ICollection)_innerDictionary).IsSynchronized; } }
        public IDataBufferEncoder this[string key] {
            get {
                if (key == null || !_innerDictionary.ContainsKey(key))
                    return null;
                return _innerDictionary[key];
            }
        }
        IDataBufferEncoder IDictionary<string, IDataBufferEncoder>.this[string key] {
            get { return this[key]; }
            set { throw new NotSupportedException(); }
        }
        object IDictionary.this[object key] {
            get { return (key != null && key is string) ? this[(string)key] : null; }
            set { throw new NotSupportedException(); }
        }
        
        public ICollection<string> Keys	{ get { return this._keys; } }

        ICollection IDictionary.Keys	{ get { return this._keys; } }

        public ICollection<IDataBufferEncoder> Values	{ get { return this._values; } }

        ICollection IDictionary.Values	{ get { return this._values; } }

        object ICollection.SyncRoot	{ get { return ((ICollection)_innerDictionary).SyncRoot; } }

        void IDictionary<string, IDataBufferEncoder>.Add(string key, IDataBufferEncoder value) { throw new NotSupportedException(); }

        void ICollection<KeyValuePair<string, IDataBufferEncoder>>.Add(KeyValuePair<string, IDataBufferEncoder> item) { throw new NotSupportedException(); }

        void IDictionary.Add(object key, object value) { throw new NotSupportedException(); }

        void IDictionary.Clear() { throw new NotSupportedException(); }

        void ICollection<KeyValuePair<string, IDataBufferEncoder>>.Clear() { throw new NotSupportedException(); }
        
        public bool ContainsKey(string key) { return key != null && _innerDictionary.ContainsKey(key); }

        bool IDictionary.Contains(object key) { return ((IDictionary)_innerDictionary).Contains(key); }

        bool ICollection<KeyValuePair<string, IDataBufferEncoder>>.Contains(KeyValuePair<string, IDataBufferEncoder> item) { return ((ICollection<KeyValuePair<string, IDataBufferEncoder>>)_innerDictionary).Contains(item); }

        public IEnumerable<KeyValuePair<string, IDataBufferEncoder>> AsEnumerable() {
            for (int i = 0; i < _innerKeys.Length; i++)
                yield return new KeyValuePair<string, IDataBufferEncoder>(_innerKeys[i], _innerValues[i]);
        }

        public IEnumerator<KeyValuePair<string, IDataBufferEncoder>> GetEnumerator() { return AsEnumerable().GetEnumerator(); }

        IDictionaryEnumerator IDictionary.GetEnumerator() { return ((IDictionary)_innerDictionary).GetEnumerator(); }

        IEnumerator IEnumerable.GetEnumerator() { return ((IEnumerable)_innerDictionary).GetEnumerator(); }

        void  ICollection<KeyValuePair<string, IDataBufferEncoder>>.CopyTo(KeyValuePair<string, IDataBufferEncoder>[] array,int arrayIndex) { ((ICollection<KeyValuePair<string, IDataBufferEncoder>>)_innerDictionary).CopyTo(array, arrayIndex); }

        void ICollection.CopyTo(Array array, int index) { ((ICollection)_innerDictionary).CopyTo(array, index); }

        bool IDictionary<string, IDataBufferEncoder>.Remove(string key) { throw new NotSupportedException(); }

        bool ICollection<KeyValuePair<string, IDataBufferEncoder>>.Remove(KeyValuePair<string, IDataBufferEncoder> item) { throw new NotSupportedException(); }

        void IDictionary.Remove(object key) { throw new NotSupportedException(); }

        public bool TryGetValue(string key,out IDataBufferEncoder value) {
            if (key != null)
                return _innerDictionary.TryGetValue(key, out value);
            value = null;
            return false;
        }
    }
}
'@

Add-Type -TypeDefinition $CodeText -ErrorAction Stop;

Function Get-JsString {
    Param(
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        [string]$Text
    )

    Process {
        '"' + $Text.Replace('\', '\\').Replace("`r", '\r').Replace("`n", '\n').Replace("`"", '\"').Replace("`t", '\t') + '"';
    }
}

Function Get-IndentedLines {
    Param(
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        [string]$Text,

        [int]$Level = 1
    )

    Begin {
        $Tab = "";
        for ($i = 0; $i -lt $Level; $i++) { $Tab += "`t" }
    }

    Process {
        $s = $Text.TrimEnd();
        if ($s.Length -gt 0) { "$Tab$s" } else { $s }
    }
}

Function Get-EncoderCodeLines {
    Param(
        [Parameter(Mandatory = $true, ValueFromPipeline = $true, ParameterSetName = 'encoder')]
        [string]$Key,
        
        [Parameter(Mandatory = $true, ValueFromPipeline = $true, ParameterSetName = 'encoding')]
        [System.Text.Encoding]$Encoding,

        [Parameter(Mandatory = $true)]
        [ValidateSet('crlf', 'lf', 'cr')]
        [string]$LineSeparator,

        [switch]$NoTrailingComma
    )

    Begin {
        "$LineSeparator`: {" | Write-Output;
        $NewLine = "`n";
        switch ($LineSeparator) {
            'crlf' { $NewLine = "`r`n" }
            'cr' { $NewLine = "`n" }
        }
        $AllLines = @();
    }
    Process {
        $ID = $Key;
        $Encoder = $null;
        $AltEncoding = $null;
        if ($PSBoundParameters.ContainsKey('Key')) {
            $Encoder = [EncodingHelper.EncodedData]::SupportedEncodings[$Key];
            $Encoding = [EncodingHelper.EncodedData]::SupportedEncodings[$Key].Encoding;
        } else {
            $Encoder = [EncodingHelper.SupportedEncodingsDictionary]::AsEncoder($Encoding);
            switch ($Encoding.WebName) {
                'utf-16' { $ID = 'utf16le'; break; }
                'utf-32' { $ID = 'utf32le'; break; }
                'iso-8859-1' { $ID = 'latin1'; break; }
                default {
                    $ID = $Encoding.WebName.Replace('-', '').ToLower();
                    if ($ID.StartsWith('ibm')) { $ID = 'ebcdic' + $ID.Substring(3) }
                    break;
                }
            }
            switch ($ID) {
                'utf8' { $AltEncoding = [System.Text.UTF8Encoding]::new($false); break; }
                'utf16le' { $AltEncoding = [System.Text.UnicodeEncoding]::new($false, $false); break; }
                'utf16be' { $AltEncoding = [System.Text.UnicodeEncoding]::new($true, $false); break; }
                'utf32le' { $AltEncoding = [System.Text.UTF32Encoding]::new($false, $false); break; }
                'utf32be' { $AltEncoding = [System.Text.UTF32Encoding]::new($true, $false); break; }
            }
        }
        if ($null -ne $Encoding) {
            $Script:XmlWriterSettings.Encoding = $Encoding;
            $Script:MetaAttribute.Value = $Encoding.WebName;
            $Script:TitleElement.InnerText = $Encoding.EncodingName;
            $MemoryStream = New-Object -TypeName 'System.IO.MemoryStream';
            $Writer = [System.Xml.XmlWriter]::Create($MemoryStream, $Script:XmlWriterSettings);
            $HtmlDocument.WriteTo($Writer);
            $Writer.Flush();
            $SourceText = ($Script:XmlWriterSettings.Encoding.GetString($MemoryStream.ToArray()) -split '\r\n?|\n') -join $NewLine;
            $Writer.Close();
            $MemoryStream.Dispose();
            $AllLines += @("`t$ID`: {");
            $AllLines += @("`t`tb64Bytes: [");
            $Script:EncodedData.LoadEncodedString($SourceText, $Encoder);
            $Lines = @((($Script:EncodedData.ToBase64String($false).Trim() -split '\r\n?|\n') | Get-JsString | Get-IndentedLines -Level 3) | Where-Object { $_.Length -gt 0});
            $AllLines += @($Lines | Select-Object -First ($Lines.Count - 1) | ForEach-Object { $_ + "," });
            $AllLines += @($Lines | Select-Object -Last 1);
            if ($AltEncoding -ne $null) {
                $Script:XmlWriterSettings.Encoding = $AltEncoding;
                $MemoryStream = New-Object -TypeName 'System.IO.MemoryStream';
                $Writer = [System.Xml.XmlWriter]::Create($MemoryStream, $Script:XmlWriterSettings);
                $HtmlDocument.WriteTo($Writer);
                $Writer.Flush();
                $SourceText = ($Script:XmlWriterSettings.Encoding.GetString($MemoryStream.ToArray()) -split '\r\n?|\n') -join $NewLine;
                $Writer.Close();
                $MemoryStream.Dispose();
            }
            $AllLines += @("`t`t],", "`t`texpected: $(Get-JsString -Text $SourceText)", "`t},");
        }
    }
    End {
        ($AllLines | Select-Object -First ($AllLines.Count - 1)) | Write-Output;
        $t = $AllLines | Select-Object -Last 1;
        $t.Substring(0, $t.Length - 1) | Write-Output;
        if ($NoTrailingComma) { '}' | Write-Output } else { '},' | Write-Output }
    }
}

Function Get-CodeLines {
    Param()

    @(
        'interface IB64LinesAndExpected {',
        '	b64Bytes: string[],',
        '	expected: string',
        '}',
        'interface IEncodingWBomBytesTestData {',
        '    utf8: IB64LinesAndExpected,',
        '    utf16le: IB64LinesAndExpected,',
        '    utf16be: IB64LinesAndExpected,',
        '    utf32le: IB64LinesAndExpected,',
        '    utf32be: IB64LinesAndExpected',
        '}',
        'interface IEncodingBytesTestData extends IEncodingWBomBytesTestData {',
        '    utf7: IB64LinesAndExpected,',
        '    ascii: IB64LinesAndExpected,',
        '    latin1: IB64LinesAndExpected,',
        '    windows: IB64LinesAndExpected,',
        '    ebcdic500: IB64LinesAndExpected,',
        '    ebcdic1140: IB64LinesAndExpected,',
        '    ebcdic37: IB64LinesAndExpected',
        '}',
        'interface IEncodingTestData {',
        '    withoutBOM: {',
        '        lf: IEncodingBytesTestData,',
        '        crlf: IEncodingBytesTestData,',
        '        cr: IEncodingBytesTestData',
        '    },',
        '    withBOM: {',
        '        lf: IEncodingWBomBytesTestData,',
        '        crlf: IEncodingWBomBytesTestData,',
        '        cr: IEncodingWBomBytesTestData',
        '    },',
        '    utf8AsHex: string[],',
        '    names: {',
        '		utf8: { name: string, webName?: string },',
        '		utf7: { name: string, webName?: string },',
        '		ascii: { name: string, webName?: string },',
        '		utf16le: { name: string, webName?: string },',
        '		utf16be: { name: string, webName?: string },',
        '		utf32le: { name: string, webName?: string },',
        '		utf32be: { name: string, webName?: string },',
        '		latin1: { name: string, webName?: string },',
        '		windows: { name: string, webName?: string },',
        '		ebcdic500: { name: string, webName?: string },',
        '		ebcdic1140: { name: string, webName?: string },',
        '		ebcdic37: { name: string, webName?: string },',
        '		base64: { name: string, webName?: string },',
        '		hex: { name: string, webName?: string }',
        '    }',
        '}',
        '',
        'let encodingTestData: IEncodingTestData = {',
        '    withoutBOM: {'
    ) | Write-Output;
    (@([EncodingHelper.EncodedData]::SupportedEncodings.Keys) | Get-EncoderCodeLines -LineSeparator 'lf') | Get-IndentedLines -Level 2;
    (@([EncodingHelper.EncodedData]::SupportedEncodings.Keys) | Get-EncoderCodeLines -LineSeparator 'crlf') | Get-IndentedLines -Level 2;
    (@([EncodingHelper.EncodedData]::SupportedEncodings.Keys) | Get-EncoderCodeLines -LineSeparator 'cr' -NoTrailingComma) | Get-IndentedLines -Level 2;
    @(
        '    },',
        '    withBOM: {'
    ) | Write-Output;
    $Encodings = @([System.Text.UnicodeEncoding]::new($false, $true, $true), [System.Text.UnicodeEncoding]::new($true, $true, $true), [System.Text.UTF32Encoding]::new($false, $true, $true),
        [System.Text.UTF32Encoding]::new($true, $true, $true), [System.Text.UTF8Encoding]::new($true, $true));
    ($Encodings | Get-EncoderCodeLines -LineSeparator 'lf') | Get-IndentedLines -Level 2;
    ($Encodings | Get-EncoderCodeLines -LineSeparator 'crlf') | Get-IndentedLines -Level 2;
    ($Encodings | Get-EncoderCodeLines -LineSeparator 'cr' -NoTrailingComma) | Get-IndentedLines -Level 2;
    $Script:XmlWriterSettings.Encoding = [System.Text.UTF8Encoding]::new($false);
    $Script:MetaAttribute.Value = $Script:XmlWriterSettings.Encoding.WebName;
    $Script:TitleElement.InnerText = $Script:XmlWriterSettings.Encoding.EncodingName;
    $MemoryStream = New-Object -TypeName 'System.IO.MemoryStream';
    $Writer = [System.Xml.XmlWriter]::Create($MemoryStream, $Script:XmlWriterSettings);
    $HtmlDocument.WriteTo($Writer);
    $Writer.Flush();
    $SourceText = ($Script:XmlWriterSettings.Encoding.GetString($MemoryStream.ToArray()) -split '\r\n?|\n') -join "`n";
    $Writer.Close();
    $MemoryStream.Dispose();
    $Script:EncodedData.LoadEncodedString($SourceText, [EncodingHelper.SupportedEncodingsDictionary]::AsEncoder($Script:XmlWriterSettings.Encoding));
    $Text = $Script:EncodedData.ToHexString();
    $HexLines = @();
    while ($Text.Length -gt 77) {
        $HexLines += @((Get-JsString -Text $Text.Substring(0, 77)) + ",");
        $Text = $Text.Substring(77);
    }
    $HexLines += @(Get-JsString -Text $Text);

    @(
        '    },',
        "    utf8AsHex: ["
    ) | Write-Output;
    ($HexLines | Get-IndentedLines -Level 2) | Write-Output;
    @(
        '    ],',
        '    names: {'
    ) | Write-Output;
    $Lines = (@([EncodingHelper.EncodedData]::SupportedEncodings.Keys) | ForEach-Object {
        $Encoder = [EncodingHelper.EncodedData]::SupportedEncodings[$_];
        if ($null -eq $Encoder.Encoding) {
            "$_`: { name: $(Get-JsString -Text $Encoder.Name) }" | Write-Output;
        } else {
            "$_`: { name: $(Get-JsString -Text $Encoder.Name), webName: $(Get-JsString -Text $Encoder.Encoding.WebName) }" | Write-Output;
        }
    }) | Get-IndentedLines -Level 2;
    $Lines | Select-Object -First ($Lines.Count - 1) | ForEach-Object { $_ + "," }
    $Lines | Select-Object -Last 1;
    @(
        '    }',
        '}'
    ) | Write-Output;
}

[xml]$Script:HtmlDocument = "<!DOCTYPE html>`r`n<html/>";
$XmlElement = $Script:HtmlDocument.DocumentElement.AppendChild($Script:HtmlDocument.CreateElement('head'));
$Script:MetaAttribute = $XmlElement.AppendChild($Script:HtmlDocument.CreateElement('meta')).Attributes.Append($Script:HtmlDocument.CreateAttribute('charset'));
$Script:TitleElement = $XmlElement.AppendChild($Script:HtmlDocument.CreateElement('title'));
$Script:HtmlDocument.DocumentElement.AppendChild($Script:HtmlDocument.CreateElement('body')).InnerText = "This is an example";

$Script:XmlWriterSettings = New-Object -TypeName 'System.Xml.XmlWriterSettings';
$Script:XmlWriterSettings.Indent = $true;
$Script:XmlWriterSettings.OmitXmlDeclaration = $true;
$Script:EncodedData = [EncodingHelper.EncodedData]::new();
$Writer = [System.IO.StreamWriter]::new(($PSScriptRoot | Join-Path -ChildPath '.\EncodingTestData.ts'), $false, ([System.Text.UTF8Encoding]::new($false, $true)));
Get-CodeLines | ForEach-Object { $_ -split '\r\n?|\n' | ForEach-Object { $Writer.WriteLine($_) } }
$Writer.Flush();
$Writer.Dispose();
