## image-metadata-provenance-service

#### Specification

```typescript
{
  IFD0: {
    Copyright: `${address}`,    
    ProcessingSoftware: ``,
    SubfileType: 0,
    ImageWidth: 0,
    ImageHeight: 0,
    ImageDescription: `${description}`,
    DocumentName: `${name}`,
    Make: `${deviceSignerMake}`,
    Model: `${deviceSignerModel}`,
    Artist: `${address},
    RawImageDigest: `${imageDigest}`,
    OriginalRawFileDigest: `${imageDigest}`
  },
  ExifIFD: {
    UserComment: `${vcJwt}`,
  }
}
```


MIT