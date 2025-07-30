# backend/app/services/forecasting.py
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from scipy import stats

class ForecastingService:
    
    @staticmethod
    def generate_sales_forecast(
        db: Session,
        forecast_periods: int = 12,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Generate sales forecast using simple trend analysis and moving averages"""
        
        # Get historical sales data
        historical_data = ForecastingService._get_historical_sales_data(db, start_date, end_date)
        
        if len(historical_data) < 3:
            return {
                'error': 'Insufficient historical data for forecasting',
                'forecast': [],
                'confidence_intervals': [],
                'accuracy_metrics': {}
            }
        
        # Convert to time series
        df = pd.DataFrame(historical_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Calculate forecast using multiple methods
        forecasts = {
            'linear_trend': ForecastingService._linear_trend_forecast(df, forecast_periods),
            'moving_average': ForecastingService._moving_average_forecast(df, forecast_periods),
            'exponential_smoothing': ForecastingService._exponential_smoothing_forecast(df, forecast_periods),
            'seasonal_naive': ForecastingService._seasonal_naive_forecast(df, forecast_periods)
        }
        
        # Ensemble forecast (weighted average)
        ensemble_forecast = ForecastingService._create_ensemble_forecast(forecasts, forecast_periods)
        
        # Calculate confidence intervals
        confidence_intervals = ForecastingService._calculate_confidence_intervals(
            df, ensemble_forecast, forecast_periods
        )
        
        # Calculate accuracy metrics on recent data
        accuracy_metrics = ForecastingService._calculate_accuracy_metrics(df)
        
        # Generate forecast dates
        last_date = df['date'].max()
        forecast_dates = []
        for i in range(1, forecast_periods + 1):
            if df['date'].dt.freq is None:
                # Assume monthly if no frequency detected
                next_date = last_date + timedelta(days=30 * i)
            else:
                next_date = last_date + pd.DateOffset(months=i)
            forecast_dates.append(next_date)
        
        # Prepare response
        forecast_data = []
        for i, date in enumerate(forecast_dates):
            forecast_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'forecasted_revenue': float(ensemble_forecast[i]),
                'lower_bound': float(confidence_intervals['lower'][i]),
                'upper_bound': float(confidence_intervals['upper'][i]),
                'method': 'ensemble'
            })
        
        return {
            'historical_data': [
                {
                    'date': row['date'].strftime('%Y-%m-%d'),
                    'actual_revenue': float(row['revenue']),
                    'orders': int(row['orders']) if 'orders' in row else None
                }
                for _, row in df.iterrows()
            ],
            'forecast': forecast_data,
            'accuracy_metrics': accuracy_metrics,
            'model_info': {
                'forecast_periods': forecast_periods,
                'methods_used': list(forecasts.keys()),
                'data_points': len(df),
                'forecast_period': f"{forecast_dates[0].strftime('%Y-%m')} to {forecast_dates[-1].strftime('%Y-%m')}"
            },
            'generated_at': datetime.now().isoformat()
        }
    
    @staticmethod
    def _get_historical_sales_data(
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict]:
        """Get historical sales data aggregated by month"""
        
        query = """
        SELECT 
            DATE_TRUNC('month', o.order_date) as date,
            SUM(o.quantity * p.price) as revenue,
            COUNT(DISTINCT o.order_id) as orders,
            COUNT(DISTINCT o.customer_id) as customers
        FROM orders o
        JOIN products p ON o.product_id = p.product_id
        WHERE 1=1
        """
        
        params = []
        if start_date:
            query += " AND o.order_date >= %s"
            params.append(start_date)
        if end_date:
            query += " AND o.order_date <= %s"
            params.append(end_date)
        
        query += " GROUP BY DATE_TRUNC('month', o.order_date) ORDER BY date"
        
        df = pd.read_sql(query, db.bind, params=params)
        return df.to_dict('records')
    
    @staticmethod
    def _linear_trend_forecast(df: pd.DataFrame, periods: int) -> List[float]:
        """Simple linear trend forecasting"""
        
        # Create numeric time index
        df_copy = df.copy()
        df_copy['time_index'] = range(len(df_copy))
        
        # Fit linear regression
        slope, intercept, r_value, p_value, std_err = stats.linregress(
            df_copy['time_index'], df_copy['revenue']
        )
        
        # Generate forecasts
        forecasts = []
        for i in range(len(df) + 1, len(df) + periods + 1):
            forecast = slope * i + intercept
            forecasts.append(max(0, forecast))  # Ensure non-negative
        
        return forecasts
    
    @staticmethod
    def _moving_average_forecast(df: pd.DataFrame, periods: int, window: int = 3) -> List[float]:
        """Moving average forecasting"""
        
        if len(df) < window:
            window = len(df)
        
        # Calculate moving average of last 'window' periods
        recent_avg = df['revenue'].tail(window).mean()
        
        # Use the average for all forecast periods
        return [recent_avg] * periods
    
    @staticmethod
    def _exponential_smoothing_forecast(df: pd.DataFrame, periods: int, alpha: float = 0.3) -> List[float]:
        """Simple exponential smoothing"""
        
        # Initialize with first value
        smoothed = [df['revenue'].iloc[0]]
        
        # Calculate exponentially smoothed values
        for i in range(1, len(df)):
            smoothed_value = alpha * df['revenue'].iloc[i] + (1 - alpha) * smoothed[-1]
            smoothed.append(smoothed_value)
        
        # Use last smoothed value for forecasting
        last_smoothed = smoothed[-1]
        return [last_smoothed] * periods
    
    @staticmethod
    def _seasonal_naive_forecast(df: pd.DataFrame, periods: int, season_length: int = 12) -> List[float]:
        """Seasonal naive forecasting (use same month from previous year)"""
        
        if len(df) < season_length:
            # If insufficient data, use simple naive (last value)
            last_value = df['revenue'].iloc[-1]
            return [last_value] * periods
        
        forecasts = []
        for i in range(periods):
            # Use value from same season in previous cycle
            seasonal_index = (len(df) + i) % season_length
            if seasonal_index < len(df):
                seasonal_value = df['revenue'].iloc[seasonal_index]
            else:
                seasonal_value = df['revenue'].iloc[-1]
            forecasts.append(seasonal_value)
        
        return forecasts
    
    @staticmethod
    def _create_ensemble_forecast(forecasts: Dict[str, List[float]], periods: int) -> List[float]:
        """Create ensemble forecast using weighted average"""
        
        # Weights for different methods (can be optimized based on historical accuracy)
        weights = {
            'linear_trend': 0.3,
            'moving_average': 0.2,
            'exponential_smoothing': 0.3,
            'seasonal_naive': 0.2
        }
        
        ensemble = []
        for i in range(periods):
            weighted_sum = 0
            total_weight = 0
            
            for method, forecast_values in forecasts.items():
                if i < len(forecast_values) and method in weights:
                    weighted_sum += weights[method] * forecast_values[i]
                    total_weight += weights[method]
            
            if total_weight > 0:
                ensemble.append(weighted_sum / total_weight)
            else:
                ensemble.append(0)
        
        return ensemble
    
    @staticmethod
    def _calculate_confidence_intervals(
        df: pd.DataFrame, 
        forecasts: List[float], 
        periods: int,
        confidence_level: float = 0.95
    ) -> Dict[str, List[float]]:
        """Calculate confidence intervals for forecasts"""
        
        # Calculate prediction error standard deviation
        if len(df) >= 2:
            # Simple approach: use standard deviation of percentage errors
            df_copy = df.copy()
            df_copy['pct_change'] = df_copy['revenue'].pct_change()
            error_std = df_copy['pct_change'].std()
            
            if pd.isna(error_std) or error_std == 0:
                error_std = 0.1  # Default 10% uncertainty
        else:
            error_std = 0.1
        
        # Calculate confidence intervals
        z_score = stats.norm.ppf((1 + confidence_level) / 2)
        
        lower_bounds = []
        upper_bounds = []
        
        for i, forecast in enumerate(forecasts):
            # Increase uncertainty with forecast horizon
            horizon_factor = 1 + (i * 0.1)  # Increase uncertainty by 10% each period
            current_std = error_std * horizon_factor
            
            margin_of_error = z_score * current_std * forecast
            
            lower_bound = max(0, forecast - margin_of_error)
            upper_bound = forecast + margin_of_error
            
            lower_bounds.append(lower_bound)
            upper_bounds.append(upper_bound)
        
        return {
            'lower': lower_bounds,
            'upper': upper_bounds
        }
    
    @staticmethod
    def _calculate_accuracy_metrics(df: pd.DataFrame) -> Dict[str, float]:
        """Calculate forecast accuracy metrics using recent data"""
        
        if len(df) < 4:
            return {
                'mean_absolute_error': 0,
                'mean_absolute_percentage_error': 0,
                'r_squared': 0
            }
        
        # Use last 25% of data for validation
        split_point = int(len(df) * 0.75)
        train_data = df.iloc[:split_point]
        test_data = df.iloc[split_point:]
        
        if len(test_data) == 0:
            return {
                'mean_absolute_error': 0,
                'mean_absolute_percentage_error': 0,
                'r_squared': 0
            }
        
        # Simple forecast using trend from training data
        if len(train_data) >= 2:
            slope, intercept, r_value, _, _ = stats.linregress(
                range(len(train_data)), train_data['revenue']
            )
            
            predictions = []
            for i in range(len(train_data), len(df)):
                pred = slope * i + intercept
                predictions.append(max(0, pred))
        else:
            # Use last value if insufficient training data
            predictions = [train_data['revenue'].iloc[-1]] * len(test_data)
        
        # Calculate metrics
        actual = test_data['revenue'].values
        predicted = np.array(predictions[:len(actual)])
        
        mae = np.mean(np.abs(actual - predicted))
        mape = np.mean(np.abs((actual - predicted) / actual)) * 100
        
        # R-squared
        ss_res = np.sum((actual - predicted) ** 2)
        ss_tot = np.sum((actual - np.mean(actual)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        
        return {
            'mean_absolute_error': float(mae),
            'mean_absolute_percentage_error': float(mape),
            'r_squared': float(max(0, r_squared))  # Ensure non-negative
        }
    
    @staticmethod
    def get_forecast_by_region(
        db: Session,
        forecast_periods: int = 6,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Generate forecasts by region"""
        
        # Get historical data by region
        query = """
        SELECT 
            o.region,
            DATE_TRUNC('month', o.order_date) as date,
            SUM(o.quantity * p.price) as revenue
        FROM orders o
        JOIN products p ON o.product_id = p.product_id
        WHERE 1=1
        """
        
        params = []
        if start_date:
            query += " AND o.order_date >= %s"
            params.append(start_date)
        if end_date:
            query += " AND o.order_date <= %s"
            params.append(end_date)
        
        query += " GROUP BY o.region, DATE_TRUNC('month', o.order_date) ORDER BY o.region, date"
        
        df = pd.read_sql(query, db.bind, params=params)
        
        regional_forecasts = {}
        
        for region in df['region'].unique():
            region_data = df[df['region'] == region].copy()
            region_data = region_data.sort_values('date')
            
            if len(region_data) >= 2:
                # Simple linear trend for each region
                region_data['time_index'] = range(len(region_data))
                slope, intercept, _, _, _ = stats.linregress(
                    region_data['time_index'], region_data['revenue']
                )
                
                forecasts = []
                last_date = region_data['date'].max()
                
                for i in range(1, forecast_periods + 1):
                    forecast_date = last_date + pd.DateOffset(months=i)
                    forecast_value = slope * (len(region_data) + i - 1) + intercept
                    
                    forecasts.append({
                        'date': forecast_date.strftime('%Y-%m-%d'),
                        'forecasted_revenue': max(0, float(forecast_value))
                    })
                
                regional_forecasts[region] = {
                    'forecasts': forecasts,
                    'historical_periods': len(region_data),
                    'trend': 'increasing' if slope > 0 else 'decreasing' if slope < 0 else 'stable'
                }
        
        return {
            'regional_forecasts': regional_forecasts,
            'forecast_periods': forecast_periods,
            'generated_at': datetime.now().isoformat()
        }