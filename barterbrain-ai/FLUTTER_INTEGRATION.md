# Sustainability Feature - Flutter Integration

## New Endpoint Available

**Function URL:**
```
https://us-central1-barterbrain-1254a.cloudfunctions.net/BarterBrainAPI
```

**New Endpoint:** `POST /swaps/confirm`

---

## API Request

**Endpoint:** `POST /swaps/confirm`

**Payload:**
```json
{
  "swapId": "firestore-swap-document-id",
  "swap": {
    "estimatedNewCost": 120,
    "proposerItemValue": 40,
    "proposerCash": 20,
    "itemName": "laptop"
  }
}
```

**Field Descriptions:**
- `swapId` (optional): Firestore document ID in `swaps` collection. If provided, the function will fetch data from Firestore and update the document with `sustainabilityImpact`.
- `swap.estimatedNewCost`: Estimated cost of buying the item new
- `swap.proposerItemValue`: Value of the item being offered
- `swap.proposerCash`: Cash amount being paid (if any)
- `swap.itemName`: Name of the item (e.g., "laptop", "chair", "desk")

---

## API Response

**Success:**
```json
{
  "success": true,
  "swapId": "abc123",
  "sustainabilityImpact": "You saved about 85 kg CO₂ and $60 by swapping instead of buying new."
}
```

**Missing Data:**
```json
{
  "success": true,
  "swapId": "abc123",
  "sustainabilityImpact": null
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "sustainabilityImpact": null
}
```

---

## Flutter Integration Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<String?> confirmSwapAndGetSustainability({
  required String swapId,
  required double estimatedNewCost,
  required double proposerItemValue,
  required double proposerCash,
  required String itemName,
}) async {
  final url = 'https://us-central1-barterbrain-1254a.cloudfunctions.net/BarterBrainAPI/swaps/confirm';
  
  try {
    final response = await http.post(
      Uri.parse(url),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'swapId': swapId,
        'swap': {
          'estimatedNewCost': estimatedNewCost,
          'proposerItemValue': proposerItemValue,
          'proposerCash': proposerCash,
          'itemName': itemName,
        }
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['sustainabilityImpact']; // String or null
    }
    return null;
  } catch (e) {
    print('Error: $e');
    return null;
  }
}

// Usage:
final impact = await confirmSwapAndGetSustainability(
  swapId: 'your-swap-id',
  estimatedNewCost: 120.0,
  proposerItemValue: 40.0,
  proposerCash: 20.0,
  itemName: 'laptop',
);

if (impact != null) {
  // Display the sustainability message to user
  print(impact); // "You saved about 85 kg CO₂ and $60..."
}
```

---

## When to Call This Endpoint

Call `/swaps/confirm` when:
1. A swap is confirmed/accepted by both users
2. You want to display sustainability impact to the user
3. You want to save the impact message to Firestore

---

## Firestore Field Names (Flexible)

The function looks for these field names in the swap document (uses first available):

**Estimated New Cost:**
- `estimatedNewCost`
- `newItem.estimatedValue`
- `newItem.valuation`
- `estimatedValueNew`
- `valuation.value`

**Item Name:**
- `itemName`
- `newItemName`
- `newItem.name`
- `title`
- `newItem.title`

**Proposer Item Value:**
- `proposerItemValue`
- `offerValue`
- `offerItem.estimatedValue`
- `offer.value`

**Proposer Cash:**
- `proposerCash`
- `cashPaid`
- `proposerPaid`

If your Firestore structure uses different field names, adjust your request payload accordingly.

---

## Response Field

The function updates the Firestore swap document with:
```
sustainabilityImpact: "One-line summary string or null"
```

You can display this string directly to users as a sustainability achievement message.
