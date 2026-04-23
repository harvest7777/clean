namespace clean.Domain.Events;

public class ArticleItemCreatedEvent : BaseEvent
{
    public ArticleItemCreatedEvent(ArticleItem item)
    {
        Item = item;
    }

    public ArticleItem Item { get; }
}
