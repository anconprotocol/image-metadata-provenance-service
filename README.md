## image-metadata-provenance-service

#### Specification

```typescript
    exif: {
      IFD0: {
        Copyright: `${payload.jwt}`,
        ImageDescription: `${payload.description}`,
        Artist: `${payload.address}`,
      },
      ExifIFD: {
        UserComment: `${payload.jwt}`,
      },
    }
```


MIT
