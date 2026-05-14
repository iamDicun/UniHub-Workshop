export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const objectKey = url.pathname.replace(/^\//, '');

    if (!objectKey) {
      return new Response('Not Found', { status: 404 });
    }

    const s3Host = `${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`;
    const s3Url = `https://${s3Host}/${objectKey}`;

    const signedRequest = await signAwsRequest(
      s3Url,
      env.AWS_REGION,
      's3',
      env.AWS_ACCESS_KEY_ID,
      env.AWS_SECRET_ACCESS_KEY,
    );

    try {
      const response = await fetch(signedRequest);

      if (!response.ok) {
        return new Response(response.body, {
          status: response.status,
          headers: response.headers,
        });
      }

      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Cache-Control': objectKey.includes('/processed/')
            ? 'public, max-age=2592000'
            : 'public, max-age=3600',
          'ETag': response.headers.get('ETag') || '',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      return new Response(`Error: ${err.message}`, { status: 500 });
    }
  },
};

async function signAwsRequest(url, region, service, accessKeyId, secretAccessKey) {
  const parsedUrl = new URL(url);
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = 'UNSIGNED-PAYLOAD';

  const canonicalHeaders =
    `host:${parsedUrl.host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

  const canonicalRequest = [
    'GET',
    parsedUrl.pathname + parsedUrl.search,
    parsedUrl.searchParams.toString() ? parsedUrl.searchParams.toString() : '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256hex(canonicalRequest),
  ].join('\n');

  const signingKey = await getSignatureKey(
    secretAccessKey,
    dateStamp,
    region,
    service,
  );

  const signature = await hmacHex(signingKey, stringToSign);

  const authorization =
    `${algorithm} Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return new Request(url, {
    headers: {
      'Host': parsedUrl.host,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      'Authorization': authorization,
    },
  });
}

async function sha256hex(message) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacHex(key, message) {
  const keyBuffer = typeof key === 'string'
    ? new TextEncoder().encode(key)
    : key;

  const algo = { name: 'HMAC', hash: 'SHA-256' };
  const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, algo, false, ['sign']);
  const signature = await crypto.subtle.sign(algo, cryptoKey, new TextEncoder().encode(message));

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function getSignatureKey(key, dateStamp, region, service) {
  const kDate = await hmacKey('AWS4' + key, dateStamp);
  const kRegion = await hmacKey(kDate, region);
  const kService = await hmacKey(kRegion, service);
  const kSigning = await hmacKey(kService, 'aws4_request');
  return kSigning;
}

function hmacKey(key, data) {
  return crypto.subtle.importKey(
    'raw',
    typeof key === 'string' ? new TextEncoder().encode(key) : key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  ).then((k) =>
    crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data)),
  );
}
