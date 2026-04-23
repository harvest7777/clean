namespace clean.Domain.Events;

public class ArticleItemPublishedEvent : BaseEvent
{
    public ArticleItemPublishedEvent(ArticleItem item)
    {
        Item = item;
    }

    public ArticleItem Item { get; }
}
