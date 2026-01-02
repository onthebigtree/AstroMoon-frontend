# Coinbase Commerce 后端集成指南

## 环境变量配置

在 Railway 后端项目中添加以下环境变量：

```bash
COINBASE_API_KEY=d9a4e67b-1e36-41c1-8260-e320ca42c470
COINBASE_WEBHOOK_SECRET=4ce01d9d-1374-446f-af76-ad2db7496144
```

## 需要安装的依赖

```bash
npm install node-fetch crypto
# 或
yarn add node-fetch crypto
```

## 后端 API 实现

### 1. 创建 Coinbase 支付订单

**路由**: `POST /api/payments/coinbase/create`

```typescript
import crypto from 'crypto';

// 星星套餐配置（与前端保持一致）
const STAR_PACKAGES = {
  stars_10: { name: '入门套餐', stars: 10, price: 5 },
  stars_30: { name: '标准套餐', stars: 30 + 5, price: 12 }, // 包含 bonus
  stars_100: { name: '豪华套餐', stars: 100 + 20, price: 35 },
  stars_300: { name: '至尊套餐', stars: 300 + 80, price: 90 },
};

app.post('/api/payments/coinbase/create', async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.uid; // 从 Firebase token 获取

    // 验证套餐
    const package = STAR_PACKAGES[packageId];
    if (!package) {
      return res.status(400).json({ error: '无效的套餐 ID' });
    }

    // 创建 Coinbase Charge
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': process.env.COINBASE_API_KEY,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify({
        name: package.name,
        description: `购买 ${package.stars} 颗星星`,
        pricing_type: 'fixed_price',
        local_price: {
          amount: package.price.toString(),
          currency: 'USD',
        },
        metadata: {
          user_id: userId,
          package_id: packageId,
          stars: package.stars,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Coinbase API Error:', error);
      return res.status(500).json({ error: '创建支付订单失败' });
    }

    const data = await response.json();
    const charge = data.data;

    // 保存订单到数据库
    await db.collection('payments').add({
      userId,
      chargeId: charge.id,
      packageId,
      packageName: package.name,
      stars: package.stars,
      amount: package.price,
      currency: 'USD',
      status: 'pending',
      hostedUrl: charge.hosted_url,
      expiresAt: charge.expires_at,
      createdAt: new Date(),
    });

    return res.json({
      chargeId: charge.id,
      hostedUrl: charge.hosted_url,
      expiresAt: charge.expires_at,
      pricing: charge.pricing,
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
});
```

### 2. Webhook 处理（接收支付通知）

**路由**: `POST /api/payments/coinbase/webhook`

```typescript
import crypto from 'crypto';

// 验证 Webhook 签名
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

app.post('/api/payments/coinbase/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-cc-webhook-signature'];
    const payload = JSON.stringify(req.body);

    // 验证签名
    if (!verifyWebhookSignature(payload, signature, process.env.COINBASE_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Received webhook event:', event.type);

    // 处理不同的事件类型
    switch (event.type) {
      case 'charge:confirmed':
        // 支付确认
        await handlePaymentConfirmed(event.data);
        break;

      case 'charge:failed':
        // 支付失败
        await handlePaymentFailed(event.data);
        break;

      case 'charge:delayed':
        // 支付延迟（等待区块链确认）
        console.log('Payment delayed:', event.data.id);
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handlePaymentConfirmed(charge: any) {
  const { id, metadata } = charge;
  const { user_id, stars } = metadata;

  console.log(`Payment confirmed for user ${user_id}, adding ${stars} stars`);

  // 1. 更新支付记录状态
  await db.collection('payments')
    .where('chargeId', '==', id)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        doc.ref.update({
          status: 'confirmed',
          confirmedAt: new Date(),
        });
      });
    });

  // 2. 添加星星到用户账户
  const userRef = db.collection('users').doc(user_id);
  await userRef.update({
    remaining_stars: admin.firestore.FieldValue.increment(stars),
    total_stars_purchased: admin.firestore.FieldValue.increment(stars),
    updated_at: new Date(),
  });

  console.log(`✅ Successfully added ${stars} stars to user ${user_id}`);
}

async function handlePaymentFailed(charge: any) {
  const { id } = charge;

  console.log(`Payment failed: ${id}`);

  // 更新支付记录状态
  await db.collection('payments')
    .where('chargeId', '==', id)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        doc.ref.update({
          status: 'failed',
          failedAt: new Date(),
        });
      });
    });
}
```

### 3. 查询支付状态

**路由**: `GET /api/payments/coinbase/status/:chargeId`

```typescript
app.get('/api/payments/coinbase/status/:chargeId', async (req, res) => {
  try {
    const { chargeId } = req.params;
    const userId = req.user.uid;

    // 从数据库查询支付记录
    const paymentDoc = await db.collection('payments')
      .where('chargeId', '==', chargeId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (paymentDoc.empty) {
      return res.status(404).json({ error: '支付记录不存在' });
    }

    const payment = paymentDoc.docs[0].data();

    return res.json({
      status: payment.status, // pending, confirmed, failed, expired
      starsAdded: payment.status === 'confirmed' ? payment.stars : undefined,
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
});
```

### 4. 获取支付历史

**路由**: `GET /api/payments/history`

```typescript
app.get('/api/payments/history', async (req, res) => {
  try {
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit) || 20;

    const paymentsSnapshot = await db.collection('payments')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const payments = paymentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        packageName: data.packageName,
        stars: data.stars,
        amount: data.amount.toString(),
        currency: data.currency,
        status: data.status,
        createdAt: data.createdAt.toISOString(),
      };
    });

    return res.json({ payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
});
```

## Coinbase Commerce Dashboard 配置

1. 登录 https://commerce.coinbase.com/
2. 进入 **Settings > Webhook subscriptions**
3. 添加 Webhook URL：
   ```
   https://astromoon-backend-production.up.railway.app/api/payments/coinbase/webhook
   ```
4. 选择以下事件：
   - `charge:confirmed`
   - `charge:failed`
   - `charge:delayed`

## 数据库表结构

### `payments` 集合

```typescript
{
  userId: string;
  chargeId: string;
  packageId: string;
  packageName: string;
  stars: number;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  hostedUrl: string;
  expiresAt: Date;
  createdAt: Date;
  confirmedAt?: Date;
  failedAt?: Date;
}
```

### `users` 集合更新

```typescript
{
  // 现有字段...
  remaining_stars: number;
  total_stars_purchased: number; // 累计购买的星星总数
}
```

## 测试步骤

1. 前端点击"购买星星"按钮
2. 选择套餐并创建订单
3. 打开 Coinbase 支付页面
4. 使用测试网络完成支付（或真实支付）
5. 支付确认后，webhook 会自动触发
6. 星星自动添加到用户账户
7. 点击"我已完成支付"查询状态

## 安全注意事项

1. ✅ 始终验证 webhook 签名
2. ✅ 使用 HTTPS
3. ✅ API Key 和 Webhook Secret 保存在环境变量中
4. ✅ 验证用户身份（Firebase token）
5. ✅ 防止重复处理（使用 chargeId 去重）
